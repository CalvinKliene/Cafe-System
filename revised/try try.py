# =============================================================
# SIX-FOUR-FIVE CAFE - CONSOLE ORDERING SYSTEM
# =============================================================
#
# INPUT   -> item, size, amount, add-ons, cash received
# PROCESS -> price lookup, subtotal, total, change
# OUTPUT  -> receipt, change
# =============================================================

cafeName = "SIX-FOUR-FIVE CAFE"

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

# Flavored Fries: customer picks ONE flavor (no extra charge)
friesFlavors = ["Cheese","BBQ","Sour Cream","Sweet Corn"]

# para nasa isang container lang lahat ng items
menu_list = threeSize + twoSize + regularSize
# para nasa isang container lang lahat ng prices
menu_price = threeSizesPrice + twoSizePrice + regularSizePrice

print("================ MENU ================")
print("--- 12oz Hot / 16oz Cold / 20oz Cold ---")
for i in range(len(menu_list)):
    if i == len(threeSize):
        print("--- 16oz Cold / 20oz Cold ---")
    if i == len(threeSize) + len(twoSize):
        print("--- One size only ---")
    print(f"{i + 1}.{menu_list[i]}: {menu_price[i]}")
print("======================================")

orderNum = 0
isOpen = True

while isOpen:
    orderList = []
    isOrdering = True
    print("")
    print("Type the item NUMBER or NAME. Type 0 to cancel the order.")

    # ---------------- Order loop to beh ----------------
    while isOrdering:
        orderInput = input("enter your order: ").strip()

        if orderInput == "0":
            print("Order cancelled.")
            orderList = []
            break

        # look for the item (the number OR the name, not case sensitive)
        index = -1
        if orderInput.isdigit():
            if int(orderInput) >= 1 and int(orderInput) <= len(menu_list):
                index = int(orderInput) - 1
        else:
            for i in range(len(menu_list)):
                if menu_list[i].lower() == orderInput.lower():
                    index = i
        if index == -1:
            print("Item not found in the menu.")
            continue

        # amount (whole number, 1 or more)
        while True:
            amountText = input("Amount:")
            if amountText.isdigit() and int(amountText) > 0:
                orderAmount = int(amountText)
                break
            print("Enter a valid amount.")

        # which sizes does this item have?
        if index < len(threeSize):
            sizeNames = ["12oz Hot", "16oz Cold", "20oz Cold"]
        elif index < len(threeSize) + len(twoSize):
            sizeNames = ["16oz Cold", "20oz Cold"]
        elif menu_list[index] == "House Blend Iced Tea":
            sizeNames = ["20oz Cold"]
        else:
            sizeNames = ["Regular"]

        # choose the size (items with only one size skip this)
        orderSize = 1
        if len(sizeNames) > 1:
            print("Sizes:")
            for n in range(len(sizeNames)):
                print(f"  {n + 1}. {sizeNames[n]} - {menu_price[index][n]}")
            while True:
                sizeText = input(f"enter your size:(1-{len(sizeNames)}): ")
                if sizeText.isdigit() and int(sizeText) >= 1 and int(sizeText) <= len(sizeNames):
                    orderSize = int(sizeText)
                    break
                print(f"Invalid size. Please enter a size between 1 and {len(sizeNames)}.")
        unitPrice = menu_price[index][orderSize - 1]

        # Flavored Fries needs ONE flavor
        flavor = ""
        if menu_list[index] == "Flavored Fries":
            print("Flavors:")
            for n in range(len(friesFlavors)):
                print(f"  {n + 1}. {friesFlavors[n]}")
            while True:
                flavorText = input("Choose ONE flavor: ")
                if flavorText.isdigit() and int(flavorText) >= 1 and int(flavorText) <= len(friesFlavors):
                    flavor = friesFlavors[int(flavorText) - 1]
                    break
                print("Invalid flavor number.")

        # drinks get the drink add-ons, food gets the food add-ons
        if index < len(threeSize) + len(twoSize) or menu_list[index] == "House Blend Iced Tea":
            addonNames = drinkAddons
            addonPrices = drinkAddonPrice
        else:
            addonNames = foodAddons
            addonPrices = foodAddonPrice

        addons = []
        wantAddon = input("Add-ons? (y/n): ").lower()
        if wantAddon == "y" or wantAddon == "yes":
            for n in range(len(addonNames)):
                print(f"  {n + 1}. {addonNames[n]} - {addonPrices[n]}")
            while True:
                addonText = input("Add-on number (0 = done): ")
                if addonText == "0":
                    break
                if not (addonText.isdigit() and int(addonText) >= 1 and int(addonText) <= len(addonNames)):
                    print("Invalid add-on number.")
                    continue
                qtyText = input("Add-on quantity: ")
                if not (qtyText.isdigit() and int(qtyText) > 0):
                    print("Enter a valid amount.")
                    continue
                addonIndex = int(addonText) - 1
                addons.append([addonNames[addonIndex], addonPrices[addonIndex], int(qtyText)])
                print(f"Added add-on: {addonNames[addonIndex]} x{qtyText}")

        orderList.append([menu_list[index], sizeNames[orderSize - 1], unitPrice, orderAmount, flavor, addons])
        print("Added Order!")
        print("------------")

        newOrder = input("Do you want to add another order? (y/n): ").lower()
        if newOrder != "y" and newOrder != "yes":
            break

    # ---------------- Payment ----------------
    if len(orderList) > 0:
        itemsTotal = 0
        addonsTotal = 0
        for name, sizeLabel, price, amount, flavor, addons in orderList:
            itemsTotal += price * amount
            for addonName, addonPrice, addonQty in addons:
                addonsTotal += addonPrice * addonQty
        total = itemsTotal + addonsTotal

        print("Order Finished")
        print("================")
        print("Items subtotal  :", itemsTotal)
        print("Add-ons subtotal:", addonsTotal)
        print("TOTAL           :", total)
        print("================")

        # cash must be enough (whole pesos)
        paid = False
        while True:
            cashText = input("Cash received (0 = cancel order): ")
            if not cashText.isdigit():
                print("Please enter a whole number.")
                continue
            cash = int(cashText)
            if cash == 0:
                print("Order cancelled.")
                break
            if cash < total:
                print("Not enough cash. Short by", total - cash)
                continue
            paid = True
            break

        # ---------------- Receipt ----------------
        if paid:
            orderNum += 1
            change = cash - total

            print("")
            print("=" * 40)
            print(cafeName.center(40))
            print("(all amounts are in PHP)".center(40))
            print("=" * 40)
            print("Order No:", orderNum)
            print("-" * 40)

            # orderList = [OrderName : OrderPrice, OrderAmount]
            for name, sizeLabel, price, amount, flavor, addons in orderList:
                print(name, "(" + sizeLabel + ")")
                print("   ", amount, "x", price, "=", price * amount)
                if flavor != "":
                    print("    Flavor:", flavor)
                for addonName, addonPrice, addonQty in addons:
                    print("    +", addonName, "x", addonQty, "=", addonPrice * addonQty)

            print("-" * 40)
            print("Items subtotal  :", itemsTotal)
            print("Add-ons subtotal:", addonsTotal)
            print("TOTAL           :", total)
            print("Cash received   :", cash)
            print("Change          :", change)
            print("=" * 40)
            print("Thank you for ordering at Six-Four-Five Cafe!")

    # ---------------- Next customer? ----------------
    again = input("Next customer? (y/n): ").lower()
    if again != "y" and again != "yes":
        isOpen = False

print("Goodbye!")