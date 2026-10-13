# =============================================================
# SIX-FOUR-FIVE CAFE - CONSOLE ORDERING SYSTEM
# =============================================================
#
# INPUT   -> item, size, amount, add-ons, cash received
# PROCESS -> price lookup, subtotal, total, change
# OUTPUT  -> receipt, change, monthly/annual report
# =============================================================

import os
import math
from datetime import datetime

cafeName = "SIX-FOUR-FIVE CAFE"

# nandito yung each finished order para gumana yng monthly/annual report blabla
salesFile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sales_log.txt")

monthNames = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"]

# DECLARATION OF SIZES AND PRICES OF PRODUCTS
# 1st size = 12oz Hot, 2nd size = 16oz Cold, 3rd size = 20oz Cold
#=== DITO EDIT KUYS ===
threeSize = ["Americano","Cafe Mocha","Cafe Latte","Caramel Macchiato","Salted Caramel Macchiato","White Chocolate Mocha","Spanish Latte","French Vanilla Latte","Caramel Latte",
    "Vanilla Latte","Brown Sugar Espresso","Six Four Five Latte","Sea Salt Latte","Dirty Matcha","Matcha Latte","Vanilla Milk","Chocolate Milk","White Chocolate Matcha",
    "Chamomile Tea"]
threeSizesPrice = [[100, 105, 120],[120, 135, 150],[105, 115, 130],[120, 140, 155],[120, 140, 160],[120, 135, 150],
[115, 130, 145],[120, 135, 150],[120, 140, 160],[115, 130, 145],[115, 130, 145],[130, 145, 160],[130, 145, 160],
[140, 155, 170],[120, 145, 160],[110, 120, 130],[110, 120, 130],[140, 155, 170],[80, 90, 100]]

# 1st size = 16oz Cold, 2nd size = 20oz Cold
twoSize = [
    "White Americano","Strawberry Milk","Strawberry White Chocolate","Mocha","Caramel",
    "Salted Caramel","Coffee Jelly","White Chocolate Mocha (Blended)","Matcha","Strawberry","Java Chip",
    "Cookies and Cream","Peppermint Mocha","Strawberry Matcha","Strawberry Black Tea","Lychee Soda",
    "Blueberry Soda","Green Apple Soda"]
twoSizePrice = [
    [160, 175],[120, 130],[135, 145],[150, 165],[150, 165],[150, 165],[155, 165],[165, 175],
    [150, 165],[120, 135],[165, 180],[170, 185],[185, 200],[165, 180],[90, 100],[90, 100],[90, 100],[90, 100]]

# only one size (food, plus House Blend Iced Tea which is 20oz only)
regularSize = [
    "Cheesy Eggdesal","Classic Burger","Cheese Burger","645 Burger","Classic Tuna","645 Tuna Sandwich","Plain Fries","Flavored Fries","Chocolate Chip Cookie","Smore's Cookie","Chocolate Crinkles",
    "House Blend Iced Tea"]
regularSizePrice = [
    [50],[50],[60],[75],[75],[105],[50],[70],[35],[50],[15],[95]]

# ADD-ONS (drink add-ons only for drinks, food add-ons only for food)
drinkAddons = ["Shot","Milk","Sugar Syrup","Oat Milk","Syrup","Strawberry","White Chocolate",
               "Whip Cream","Coffee Jelly","Crushed Oreo","Chocolate Chips"]
drinkAddonPrice = [35, 15, 15, 50, 20, 15, 30, 20, 20, 20, 20]
foodAddons = ["Cheese","Egg","Coleslaw"]
foodAddonPrice = [10, 20, 20]

# Flavored Fries: customer must pick ONE flavor (no extra charge)
friesFlavors = ["Cheese","BBQ","Sour Cream","Sweet Corn"]

# para nasa isang container lang lahat ng items
menu_list = threeSize + twoSize + regularSize
# para nasa isang container lang lahat ng prices
menu_price = threeSizesPrice + twoSizePrice + regularSizePrice


# =============================================================
# SMALL HELPER FUNCTIONS BLABLABLA
# =============================================================

def get_int_input(question):
    while True:
        try:
            return int(input(question))
        except ValueError:
            print("Please enter a whole number.")


def get_money_input(question):
    while True:
        try:
            value = float(input(question))
            if math.isfinite(value):
                return round(value, 2)
        except ValueError:
            pass
        print("Please enter a valid amount.")


def ask_yes_no(question):
    while True:
        answer = input(question + " (y/n): ").strip().lower()
        if answer == "y" or answer == "yes":
            return True
        if answer == "n" or answer == "no":
            return False
        print("Please type y or n.")


def money(amount):
    return "PHP " + format(amount, ",.2f")


def receipt_line(left, right, width=46):
    spaces = width - len(left) - len(right)
    if spaces < 1:
        spaces = 1
    return left + " " * spaces + right


def get_size_names(index):
    # which sizes does this item have?
    if index < len(threeSize):
        return ["12oz Hot", "16oz Cold", "20oz Cold"]
    if index < len(threeSize) + len(twoSize):
        return ["16oz Cold", "20oz Cold"]
    if menu_list[index] == "House Blend Iced Tea":
        return ["20oz Cold"]
    return ["Regular"]


def is_drink(index):
    return index < len(threeSize) + len(twoSize) or menu_list[index] == "House Blend Iced Tea"


def find_item(text):
    # the customer can type the item NUMBER or the item NAME (not case sensitive para anu)
    if text.isdigit():
        number = int(text)
        if number >= 1 and number <= len(menu_list):
            return number - 1
        return -1
    for i in range(len(menu_list)):
        if menu_list[i].lower() == text.lower():
            return i
    return -1


# =============================================================
# showing the menu type shi
# =============================================================

def show_menu():
    print("================ MENU ================")
    print("--- 12oz Hot / 16oz Cold / 20oz Cold ---")
    for i in range(len(menu_list)):
        if i == len(threeSize):
            print("--- 16oz Cold / 20oz Cold ---")
        if i == len(threeSize) + len(twoSize):
            print("--- One size only ---")
        print(f"{i + 1}.{menu_list[i]}: {menu_price[i]}")
    print("======================================")


# =============================================================
# TAKING THE ORDER
# Each line in orderList = [index, size, amount, addons, flavor]
#   addons = list of [addon name, addon price, addon quantity]
# =============================================================

def choose_size(index):
    sizeNames = get_size_names(index)
    if len(sizeNames) == 1:
        return 1
    print("Sizes:")
    for n in range(len(sizeNames)):
        print(f"  {n + 1}. {sizeNames[n]} - {money(menu_price[index][n])}")
    while True:
        size = get_int_input(f"enter your size:(1-{len(sizeNames)}): ")
        if size >= 1 and size <= len(sizeNames):
            return size
        print(f"Invalid size. Please enter a size between 1 and {len(sizeNames)}.")


def choose_flavor():
    print("Flavors:")
    for n in range(len(friesFlavors)):
        print(f"  {n + 1}. {friesFlavors[n]}")
    while True:
        number = get_int_input("Choose ONE flavor: ")
        if number >= 1 and number <= len(friesFlavors):
            return friesFlavors[number - 1]
        print("Invalid flavor number.")


def choose_addons(index):
    chosen = []
    if is_drink(index):
        addonNames = drinkAddons
        addonPrices = drinkAddonPrice
    else:
        addonNames = foodAddons
        addonPrices = foodAddonPrice

    if not ask_yes_no("Add-ons?"):
        return chosen

    for n in range(len(addonNames)):
        print(f"  {n + 1}. {addonNames[n]} - {money(addonPrices[n])}")

    while True:
        number = get_int_input("Add-on number (0 = done): ")
        if number == 0:
            break
        if number < 1 or number > len(addonNames):
            print("Invalid add-on number.")
            continue
        quantity = get_int_input("Add-on quantity: ")
        if quantity <= 0:
            print("Enter a valid amount.")
            continue
        chosen.append([addonNames[number - 1], addonPrices[number - 1], quantity])
        print(f"Added add-on: {addonNames[number - 1]} x{quantity}")
    return chosen


def take_order():
    orderList = []
    print("Type the item NUMBER or NAME. Type 0 to cancel the order.")

    # Order loop to beh
    while True:
        orderInput = input("enter your order: ").strip()

        if orderInput == "0":
            print("Order cancelled.")
            return []

        index = find_item(orderInput)
        if index == -1:
            print("Item not found in the menu.")
            continue

        orderAmount = get_int_input("Amount:")
        if orderAmount <= 0:
            print("Enter a valid amount.")
            continue

        orderSize = choose_size(index)

        flavor = ""
        if menu_list[index] == "Flavored Fries":
            flavor = choose_flavor()

        addons = choose_addons(index)

        orderList.append([index, orderSize, orderAmount, addons, flavor])
        print("Added Order!")
        print("------------")

        if not ask_yes_no("Do you want to add another order?"):
            break

    return orderList


# =============================================================
# sales records
# Each line:  2026-09-17 15:04:05 | 645-0001 | 275.0
# =============================================================

def read_sales():
    sales = []
    if not os.path.exists(salesFile):
        return sales
    with open(salesFile, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.strip().split(" | ")
            if len(parts) != 3:
                continue
            try:
                year = int(parts[0][0:4])
                month = int(parts[0][5:7])
                total = float(parts[2])
            except ValueError:
                continue
            sales.append([year, month, total])
    return sales


def get_next_order_number():
    return "645-" + str(len(read_sales()) + 1).zfill(4)


def save_sale(now, orderNumber, total):
    with open(salesFile, "a", encoding="utf-8") as file:
        file.write(now.strftime("%Y-%m-%d %H:%M:%S") + " | " + orderNumber + " | " + str(total) + "\n")


def monthly_report():
    year = get_int_input("Enter year (example 2026): ")
    month = get_int_input("Enter month (1-12): ")
    if month < 1 or month > 12:
        print("Month must be 1 to 12.")
        return

    totalSales = 0
    count = 0
    for saleYear, saleMonth, saleTotal in read_sales():
        if saleYear == year and saleMonth == month:
            totalSales += saleTotal
            count += 1

    print("================")
    print(f"MONTHLY SALES - {monthNames[month - 1]} {year}")
    if count == 0:
        print("No sales recorded for this month.")
    else:
        print("Total sales  :", money(totalSales))
        print("Transactions :", count)
    print("================")


def annual_report():
    year = get_int_input("Enter year (example 2026): ")

    monthTotals = [0] * 12
    monthCounts = [0] * 12
    for saleYear, saleMonth, saleTotal in read_sales():
        if saleYear == year:
            monthTotals[saleMonth - 1] += saleTotal
            monthCounts[saleMonth - 1] += 1

    print("================")
    print(f"ANNUAL SALES - {year}")
    if sum(monthCounts) == 0:
        print("No sales recorded for this year.")
    else:
        for m in range(12):
            word = "transaction" if monthCounts[m] == 1 else "transactions"
            print(f"{monthNames[m].ljust(10)} {money(monthTotals[m]).rjust(16)}   ({monthCounts[m]} {word})")
        print("----------------")
        print("Total sales  :", money(sum(monthTotals)))
        print("Transactions :", sum(monthCounts))
    print("================")


# =============================================================
# payment tas receipt
# =============================================================

def print_receipt(now, orderNumber, orderList, itemsTotal, addonsTotal, total, cash, change):
    width = 46
    print("")
    print("=" * width)
    print(cafeName.center(width))
    print("COFFEE  -  SIZZLING".center(width))
    print("=" * width)
    print("Order No: " + orderNumber)
    print("Date    : " + now.strftime("%Y-%m-%d %I:%M %p"))
    print("-" * width)

    # orderList = [index, size, amount, addons, flavor]
    for index, size, amount, addons, flavor in orderList:
        unit_price = menu_price[index][size - 1]
        print(menu_list[index])
        detail = f"  {get_size_names(index)[size - 1]}  {amount} x {money(unit_price)}"
        print(receipt_line(detail, money(unit_price * amount), width))
        if flavor != "":
            print("  Flavor: " + flavor)
        for addonName, addonPrice, addonQty in addons:
            print(receipt_line(f"  + {addonName} x{addonQty}", money(addonPrice * addonQty), width))

    print("-" * width)
    print(receipt_line("Items subtotal", money(itemsTotal), width))
    print(receipt_line("Add-ons subtotal", money(addonsTotal), width))
    print(receipt_line("TOTAL", money(total), width))
    print("-" * width)
    print(receipt_line("Cash received", money(cash), width))
    print(receipt_line("Change", money(change), width))
    print("=" * width)
    print("Thank you for ordering at Six-Four-Five Cafe!".center(width))
    print("")


def checkout(orderList):
    itemsTotal = 0
    addonsTotal = 0
    for index, size, amount, addons, flavor in orderList:
        itemsTotal += menu_price[index][size - 1] * amount
        for addonName, addonPrice, addonQty in addons:
            addonsTotal += addonPrice * addonQty
    total = itemsTotal + addonsTotal

    print("Order Finished")
    print("================")
    print("Items subtotal  :", money(itemsTotal))
    print("Add-ons subtotal:", money(addonsTotal))
    print("TOTAL           :", money(total))
    print("================")

    # cash must be enough
    while True:
        cash = get_money_input("Cash received (0 = cancel order): ")
        if cash == 0:
            print("Order cancelled.")
            return
        if cash < 0:
            print("Cash cannot be negative.")
            continue
        if cash < total:
            print("Not enough cash. Short by", money(total - cash))
            continue
        break
    change = round(cash - total, 2)

    now = datetime.now()
    orderNumber = get_next_order_number()
    save_sale(now, orderNumber, total)
    print_receipt(now, orderNumber, orderList, itemsTotal, addonsTotal, total, cash, change)


# =============================================================
# MAIN PROGRAM
# =============================================================

def main():
    show_menu()
    while True:
        print("")
        print("1. New order")
        print("2. Monthly sales report")
        print("3. Annual sales report")
        print("4. Show menu again")
        print("5. Exit")
        choice = input("Choose (1-5): ").strip()

        if choice == "1":
            orderList = take_order()
            if len(orderList) > 0:
                checkout(orderList)
        elif choice == "2":
            monthly_report()
        elif choice == "3":
            annual_report()
        elif choice == "4":
            show_menu()
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please type 1 to 5.")


if __name__ == "__main__":
    main()