from dataclasses import dataclass
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime,timedelta

#-----------------------------------------
class NegativeDaysError(Exception):
    def __init__(self, days):
        super().__init__(f"Rental duration cannot be negative: {days}")

class UnavailableVehicleError(Exception):
    def __init__(self, model):
        super().__init__(f"Vehicle '{model}' is not available for rent")

class InvalidInputError(Exception):
    def __init__(self, msg="Invalid input entered"):
        super().__init__(msg)
#----------------------------------------

class Vehicle(ABC):
    def __init__(self, model, year, price, status, rental_count=0):
        self.model = model
        self.year = year
        self.price = price
        self.status = status
        self.rental_count = rental_count

    def _validate_days(self, days):
        if days < 0:
            raise NegativeDaysError(days)

    @abstractmethod
    def rent_cost(self,days):
        pass

    @abstractmethod
    def vehicle_info(self):
        pass

# ----------------------------------


class Car(Vehicle):
    def __init__(self, model, year, price, service_type, status, rental_count=0):
        super().__init__(model, year, price, status, rental_count)
        self.service_type = service_type

    def rent_cost(self, days):
        self._validate_days(days)
        if self.service_type == ServiceType.LUXURY.value:
            return (self.price * 1.3) * days
        elif self.service_type == ServiceType.EXPRESS.value:
            return (self.price * 1.2) * days
        elif self.service_type == ServiceType.NORMAL.value:
            return self.price * days
        else:
            raise InvalidInputError("Invalid service type")

    def vehicle_info(self):
        return f"""Model: {self.model}
Made in: {self.year}
Price per day: {self.price}
Service type: {ServiceType(self.service_type).name}
Status: {VehicleStatus(self.status).name}"""


class Bike(Vehicle):
    def __init__(self, model, year, price, tire_type, status, rental_count=0):
        super().__init__(model, year, price, status, rental_count)
        self.tire_type = tire_type

    def rent_cost(self, days):
        self._validate_days(days)
        if days < 1:
            return self.rent_cost_hour(days)
        if self.tire_type == TireType.CITY.value:
            return self.price * days
        elif self.tire_type == TireType.MOUNTAIN.value:
            return (self.price * 1.2) * days
        elif self.tire_type == TireType.SPORT.value:
            return (self.price * 1.5) * days
        else:
            raise InvalidInputError("Invalid tire type")

    def rent_cost_hour(self, hours):
        hours = round(hours * 24)
        if self.tire_type == TireType.CITY.value:
            return round(self.price / 24) * hours
        elif self.tire_type == TireType.MOUNTAIN.value:
            return round((self.price * 1.2) / 24) * hours
        elif self.tire_type == TireType.SPORT.value:
            return round((self.price * 1.5) / 24) * hours
        else:
            raise InvalidInputError("Invalid tire type")

    def vehicle_info(self):
        return f"""Model: {self.model}
Year: {self.year}
Price: {self.price}
Price per hour: {round(self.price / 24, 2)}
Tire: {TireType(self.tire_type).name}
Status: {VehicleStatus(self.status).name}"""


class Truck(Vehicle):
    def __init__(self, model, year, price, load_capacity, load, fuel_type, status, rental_count=0):
        super().__init__(model, year, price, status, rental_count)
        self.load_capacity = load_capacity
        self.fuel_type = fuel_type
        self.load = load

    def rent_cost(self, days):
        self._validate_days(days)
        if self.load > self.load_capacity:
            raise InvalidInputError(
                f"Load {self.load}kg exceeds capacity {self.load_capacity}kg — Traffic Violation!"
            )
        if self.fuel_type == FuelType.GAS.value:
            return (self.price * 1.2) * (self.load / 1000) * days
        elif self.fuel_type == FuelType.DIESEL.value:
            return self.price * (self.load / 1000) * days
        elif self.fuel_type == FuelType.ELECTRIC.value:
            return (self.price * 1.5) * (self.load / 1000) * days
        else:
            raise InvalidInputError("Invalid fuel type")

    def vehicle_info(self):
        return f"""Model: {self.model}
Year: {self.year}
Price: {self.price}
Load capacity: {self.load_capacity}
Fuel type: {FuelType(self.fuel_type).name}
Status: {VehicleStatus(self.status).name}"""

#--------------------------------

class FuelType(Enum):
    GAS = 1
    DIESEL = 2
    ELECTRIC = 3

class VehicleStatus(Enum):
    AVAILABLE = 1
    RENTED = 2
    MAINTENANCE = 3

class TireType(Enum):
    CITY = 1
    MOUNTAIN = 2
    SPORT = 3

class ServiceType(Enum):
    NORMAL = 1
    EXPRESS = 2
    LUXURY = 3
#--------------------------------

@dataclass
class RentalRecord:
    customer_name: str
    rented_vehicle: Vehicle
    start_date: datetime
    end_date: datetime

#---------------------------
def total_income(orders):
    total = 0
    for order in orders:
        if type(order.rented_vehicle) == Bike:
            time_difference_days = (order.end_date-order.start_date).days
            time_difference = (order.end_date-order.start_date).seconds
            days = round(time_difference/(3600*24) + time_difference_days,1)
            total += order.rented_vehicle.rent_cost(days)
        else:
            total += order.rented_vehicle.rent_cost((order.end_date - order.start_date).days)
    return total

def available_vehicles(vehicles):
    available = []
    for vehicle in vehicles:
        if vehicle.status == VehicleStatus.AVAILABLE.value:
            available.append(vehicle)
    return available

def print_available_vehicles(vehicles):
    models = []
    for vehicle in available_vehicles(vehicles):
        models.append(vehicle.model)
    if len(models) == 0:
        print("No available vehicles")
        return
    else:
        return models

def check_vehicles(vehicles):
    while True:
        try:
            avail = available_vehicles(vehicles)
            if not avail:
                raise UnavailableVehicleError("all vehicles")
            rent_vehicle_name = input(f"""Please enter the vehicle you want to rent:
    List of available vehicles: {print_available_vehicles(vehicles)}
    ----------------------------------------------------------
    Car name: """)
            for vehicle in avail:
                if rent_vehicle_name == vehicle.model:
                    print("Successfully rented vehicle!")
                    vehicle.status = VehicleStatus.RENTED.value
                    vehicle.rental_count += 1
                    get_type(vehicle)
                    return vehicle
            print("Sorry, we don't have that model! Please try again.")
        except UnavailableVehicleError as e:
            print(f"Error: {e}")
            return None

def get_type(vehicle):
    while True:
        try:
            if type(vehicle) == Car:
                service_type = int(input("""Please enter service type:
    1 for Normal, 2 for Express, 3 for Luxury:
    ------------------------------------------
    : """))
                if service_type not in [1, 2, 3]:
                    raise InvalidInputError("Please enter 1, 2, or 3")
                vehicle.service_type = service_type
                return
            elif type(vehicle) == Bike:
                tire_type = int(input("""Please enter tire type:
    1 for City, 2 for Mountain, 3 for Sport:
    ----------------------------------------
    : """))
                if tire_type not in [1, 2, 3]:
                    raise InvalidInputError("Please enter 1, 2, or 3")
                vehicle.tire_type = tire_type
                return
            else:
                load = int(input(f"""Please enter load in kg:
    Load capacity is {vehicle.load_capacity}kg
    ---------------------------------------
    : """))
                if load > vehicle.load_capacity:
                    raise InvalidInputError(
                        f"Exceeded the load capacity! Max is {vehicle.load_capacity}kg"
                    )
                fuel_type = int(input("""Please enter the fuel type:
    1 for Gas, 2 for Diesel, 3 for Electric
    ---------------------------------------
    : """))
                if fuel_type not in [1, 2, 3]:
                    raise InvalidInputError("Please enter 1, 2, or 3")
                vehicle.load = load
                vehicle.fuel_type = fuel_type
                return
        except InvalidInputError as e:
            print(f"Input Error: {e} — please try again.")
        except ValueError:
            print("Please enter a valid number.")

def most_rented_vehicle(vehicles):
    max = 0
    most_rented_vehicle_model = ""
    for vehicle in vehicles:
        if vehicle.rental_count > max:
            max = vehicle.rental_count
            most_rented_vehicle_model = vehicle.model
    print(f"Most rented vehicle is: {most_rented_vehicle_model}. Total of {max} times rented")

def rent_date(vehicle):
    while True:
        try:
            if type(vehicle) == Bike:
                rent_type = input("How would you like to rent? (h) for hours, (d) for days: ").lower()
                if rent_type == "h":
                    end_date = int(input("How many hours? "))
                    if end_date <= 0:
                        raise NegativeDaysError(end_date)
                    return vehicle, datetime.now(), datetime.now() + timedelta(hours=end_date)
                elif rent_type == "d":
                    end_date = int(input("How many days? "))
                    if end_date <= 0:
                        raise NegativeDaysError(end_date)
                    return vehicle, datetime.now(), datetime.now() + timedelta(days=end_date)
                else:
                    print("Please enter 'h' or 'd'.")
            else:
                end_date = int(input("How many days would you like to rent? "))
                if end_date <= 0:
                    raise NegativeDaysError(end_date)
                return vehicle, datetime.now(), datetime.now() + timedelta(days=end_date)
        except NegativeDaysError as e:
            print(f"Error: {e} — please enter a positive number.")
        except ValueError:
            print("Please enter a valid number.")


def ordering():
    owner = input("Please enter your name: ").capitalize()
    vehicle = check_vehicles(vehicles)
    if vehicle is None:
        return None
    detail = rent_date(vehicle)
    return RentalRecord(owner, detail[0], detail[1], detail[2])

def print_order_details(order):
    if order is None:
        return
    try:
        days = (order.end_date - order.start_date).days
        cost = order.rented_vehicle.rent_cost(days)
        print(f"""
Order details:
o----------------------------------0
Owner      : {order.customer_name}
─────────────────────────────────────
{order.rented_vehicle.vehicle_info()}
─────────────────────────────────────
Start date : {order.start_date}
End date   : {order.end_date}
─────────────────────────────────────
Total cost : {round(cost,2)}""")
    except (NegativeDaysError, InvalidInputError) as e:
        print(f"Error calculating order: {e}")
#---------------------------
vehicle1 = Car("X1SUV", 2025, 1000, 1, 1)
vehicle2 = Car("X2SUV", 2026, 2500, 1, 1)
vehicle3 = Car("Z1SUV", 2017, 900, 1, 1)

bike1 = Bike("BMX1", 2019, 500, 1, 1)
bike2 = Bike("BMX2", 2020, 550, 1, 1)
bike3 = Bike("BMX3", 2022, 670, 1, 1)

truck1 = Truck("LorryM1", 2017, 700, 1000, 1, 1, 1)
truck2 = Truck("LorryM2",2019, 820, 1250, 1, 1, 1)
truck3 = Truck("LorryM3", 2021, 875, 1500, 1, 1, 1)

vehicles = [vehicle1, vehicle2, vehicle3, bike1, bike2, bike3, truck1, truck2, truck3]

order1 = RentalRecord("William", truck1, datetime.now(), datetime.now()+timedelta(days=20))
order2 = RentalRecord("Johan", truck2, datetime.now(), datetime.now()+timedelta(days=30))
order3 = RentalRecord("Albert", vehicle3, datetime.now(), datetime.now()+timedelta(hours=10))
order4 = RentalRecord("Bob", vehicle2, datetime.now(), datetime.now()+timedelta(days=2))
order5 = RentalRecord("Colan", bike1, datetime.now(), datetime.now()+timedelta(days=3, hours=10))
order6 = RentalRecord("Thierry", bike2, datetime.now(), datetime.now()+timedelta(hours=5))
order7 = RentalRecord("Ashley", bike3, datetime.now(), datetime.now()+timedelta(days=5))
orders = [order1, order5, order6]

#---------------------------
app = True
while app:
    print_order_details(ordering())
    most_rented_vehicle(vehicles)
    action = input("Do you want to continue? (y/n): ").lower()
    if action == "n":
        print("Thank you for using this program.")
        app = False

