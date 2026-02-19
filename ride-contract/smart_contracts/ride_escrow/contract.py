"""
RIDE - Decentralized Ride-Sharing Escrow Smart Contract
Built on Algorand using AlgoKit & Algorand Python SDK

Manages ride-sharing with on-chain escrow payments:
- Drivers post rides with a price per seat
- Riders join by paying ALGO into the contract (escrow)
- On completion, escrowed ALGO released to driver
- On cancellation, riders get refunded
"""

from algopy import (
    ARC4Contract,
    Account,
    Global,
    Txn,
    UInt64,
    gtxn,
    itxn,
    op,
)
from algopy.arc4 import abimethod, String as ARC4String


class RideEscrow(ARC4Contract):
    """
    Ride Escrow Smart Contract for decentralized ride-sharing.

    State layout per ride (box key = "r" + ride_id as 8 bytes):
      driver address (32 bytes) + price (8) + seats (8) +
      seats_taken (8) + is_active (8) + is_completed (8) = 72 bytes

    Passenger tracking (box key = "p" + ride_id(8) + index(8)):
      rider address (32 bytes)
    """

    def __init__(self) -> None:
        self.ride_counter = UInt64(0)
        self.total_completed = UInt64(0)
        self.total_rides_created = UInt64(0)

    # ==================== DRIVER ACTIONS ====================

    @abimethod()
    def create_ride(self, price: UInt64, seats: UInt64) -> UInt64:
        """
        Driver creates a new ride listing.
        Args:
            price: price per seat in microALGO (e.g., 1_000_000 = 1 ALGO)
            seats: available seats (1-6)
        Returns: ride_id
        """
        assert seats >= UInt64(1), "Min 1 seat"
        assert seats <= UInt64(6), "Max 6 seats"
        assert price > UInt64(0), "Price must be > 0"

        self.ride_counter += UInt64(1)
        ride_id = self.ride_counter

        # Build box key
        ride_key = op.concat(b"r", op.itob(ride_id))

        # Build ride data: 72 bytes total
        ride_data = op.concat(
            Txn.sender.bytes,
            op.concat(
                op.itob(price),
                op.concat(
                    op.itob(seats),
                    op.concat(
                        op.itob(UInt64(0)),   # seats_taken
                        op.concat(
                            op.itob(UInt64(1)),   # is_active = true
                            op.itob(UInt64(0)),   # is_completed = false
                        ),
                    ),
                ),
            ),
        )

        op.Box.put(ride_key, ride_data)
        self.total_rides_created += UInt64(1)

        return ride_id

    @abimethod()
    def join_ride(self, ride_id: UInt64, payment: gtxn.PaymentTransaction) -> None:
        """
        Rider joins a ride by paying the price into escrow.
        Must be a grouped transaction: payment + app call.
        """
        ride_key = op.concat(b"r", op.itob(ride_id))
        # op.Box.get returns (Bytes, bool) — value first, exists second
        data, data_exists = op.Box.get(ride_key)
        assert data_exists, "Ride not found"

        # Parse stored ride data
        driver_bytes = op.extract(data, 0, 32)
        price = op.btoi(op.extract(data, 32, 8))
        seats = op.btoi(op.extract(data, 40, 8))
        taken = op.btoi(op.extract(data, 48, 8))
        active = op.btoi(op.extract(data, 56, 8))

        # Validations
        assert active == UInt64(1), "Ride not active"
        assert taken < seats, "Ride is full"
        assert Txn.sender.bytes != driver_bytes, "Driver can't join own ride"
        assert payment.receiver == Global.current_application_address, "Pay the contract"
        assert payment.amount == price, "Wrong payment amount"

        # Store passenger in a separate box
        pass_key = op.concat(b"p", op.concat(op.itob(ride_id), op.itob(taken)))
        op.Box.put(pass_key, Txn.sender.bytes)

        # Update seats_taken in ride data
        new_taken = taken + UInt64(1)
        updated = op.concat(
            driver_bytes,
            op.concat(
                op.itob(price),
                op.concat(
                    op.itob(seats),
                    op.concat(
                        op.itob(new_taken),
                        op.concat(
                            op.itob(UInt64(1)),   # still active
                            op.itob(UInt64(0)),   # not completed
                        ),
                    ),
                ),
            ),
        )
        op.Box.put(ride_key, updated)

    @abimethod()
    def cancel_booking(self, ride_id: UInt64) -> None:
        """
        Rider cancels their booking. Gets refund minus 0.1 ALGO penalty.
        Penalty stays in contract (goes to driver as compensation).
        """
        ride_key = op.concat(b"r", op.itob(ride_id))
        data, data_exists = op.Box.get(ride_key)
        assert data_exists, "Ride not found"

        driver = Account(op.extract(data, 0, 32))
        price = op.btoi(op.extract(data, 32, 8))
        taken = op.btoi(op.extract(data, 48, 8))
        active = op.btoi(op.extract(data, 56, 8))

        assert active == UInt64(1), "Ride not active"
        assert Txn.sender != driver, "Driver cannot cancel booking"

        # Find rider's index
        i = UInt64(0)
        found_index = UInt64(999)
        while i < taken:
            pass_key = op.concat(b"p", op.concat(op.itob(ride_id), op.itob(i)))
            p_data, p_exists = op.Box.get(pass_key)
            if p_exists and Account(p_data) == Txn.sender:
                found_index = i
                break
            i += UInt64(1)

        assert found_index != UInt64(999), "Not a passenger of this ride"

        # Calculate refund: price - 0.1 ALGO penalty
        penalty = UInt64(100_000)  # 0.1 ALGO
        refund_amount = price - penalty if price > penalty else UInt64(0)

        # Refund rider (minus penalty)
        if refund_amount > UInt64(0):
            itxn.Payment(
                receiver=Txn.sender,
                amount=refund_amount,
                fee=UInt64(0),
            ).submit()

        # Send penalty to driver as compensation
        if penalty > UInt64(0):
            itxn.Payment(
                receiver=driver,
                amount=penalty,
                fee=UInt64(0),
            ).submit()

        # Remove passenger from box
        pass_key = op.concat(b"p", op.concat(op.itob(ride_id), op.itob(found_index)))
        op.Box.delete(pass_key)

        # Decrease seats_taken
        new_taken = taken - UInt64(1) if taken > UInt64(0) else UInt64(0)
        updated = op.concat(
            op.extract(data, 0, 48),
            op.concat(
                op.itob(new_taken),
                op.extract(data, 56, 16),
            ),
        )
        op.Box.put(ride_key, updated)

    @abimethod()
    def complete_ride(self, ride_id: UInt64) -> None:
        """
        Driver marks ride as completed.
        Escrowed ALGO (price × passengers) is released to the driver.
        """
        ride_key = op.concat(b"r", op.itob(ride_id))
        data, data_exists = op.Box.get(ride_key)
        assert data_exists, "Ride not found"

        driver = Account(op.extract(data, 0, 32))
        price = op.btoi(op.extract(data, 32, 8))
        taken = op.btoi(op.extract(data, 48, 8))
        active = op.btoi(op.extract(data, 56, 8))
        completed = op.btoi(op.extract(data, 64, 8))

        assert Txn.sender == driver, "Only driver can complete"
        assert active == UInt64(1), "Not active"
        assert completed == UInt64(0), "Already completed"
        assert taken > UInt64(0), "No passengers"

        # Pay the driver: price * number of passengers
        total = price * taken
        itxn.Payment(
            receiver=driver,
            amount=total,
            fee=UInt64(0),
        ).submit()

        # Update ride: active=false, completed=true
        updated = op.concat(
            op.extract(data, 0, 48),   # driver + price + seats unchanged
            op.concat(
                op.itob(taken),            # seats_taken unchanged
                op.concat(
                    op.itob(UInt64(0)),    # active = false
                    op.itob(UInt64(1)),    # completed = true
                ),
            ),
        )
        op.Box.put(ride_key, updated)
        self.total_completed += UInt64(1)

    @abimethod()
    def cancel_ride(self, ride_id: UInt64) -> None:
        """
        Driver cancels ride. All passengers are refunded.
        Driver pays 0.1 ALGO penalty per passenger.
        """
        ride_key = op.concat(b"r", op.itob(ride_id))
        data, data_exists = op.Box.get(ride_key)
        assert data_exists, "Ride not found"

        driver = Account(op.extract(data, 0, 32))
        price = op.btoi(op.extract(data, 32, 8))
        taken = op.btoi(op.extract(data, 48, 8))
        active = op.btoi(op.extract(data, 56, 8))

        assert Txn.sender == driver, "Only driver can cancel"
        assert active == UInt64(1), "Not active"

        penalty_per_rider = UInt64(100_000)  # 0.1 ALGO per rider

        # Refund each passenger + penalty compensation
        i = UInt64(0)
        while i < taken:
            pass_key = op.concat(b"p", op.concat(op.itob(ride_id), op.itob(i)))
            p_data, p_exists = op.Box.get(pass_key)
            if p_exists:
                rider = Account(p_data)
                # Refund original price + 0.1 ALGO compensation
                refund_with_penalty = price + penalty_per_rider
                itxn.Payment(
                    receiver=rider,
                    amount=refund_with_penalty,
                    fee=UInt64(0),
                ).submit()
                op.Box.delete(pass_key)
            i += UInt64(1)

        # Update ride: active=false
        updated = op.concat(
            op.extract(data, 0, 48),
            op.concat(
                op.itob(taken),
                op.concat(
                    op.itob(UInt64(0)),    # active = false
                    op.extract(data, 64, 8),  # completed stays same
                ),
            ),
        )
        op.Box.put(ride_key, updated)

    # ==================== READ-ONLY VIEWS ====================

    @abimethod(readonly=True)
    def get_ride_count(self) -> UInt64:
        """Returns total number of rides ever created."""
        return self.ride_counter

    @abimethod(readonly=True)
    def get_total_completed(self) -> UInt64:
        """Returns number of completed rides."""
        return self.total_completed

    @abimethod(readonly=True)
    def get_total_rides(self) -> UInt64:
        """Returns total rides created on the platform."""
        return self.total_rides_created

    @abimethod(readonly=True)
    def get_platform_info(self) -> ARC4String:
        """Returns platform identification string."""
        return ARC4String("RIDE - Decentralized Ride Sharing on Algorand")
