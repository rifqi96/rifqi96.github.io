stop_loss_percent = float(input("Enter the stop loss percentage: "))
stop_loss_dollar = float(input("Enter the stop loss in dollar: "))
leverage = float(input("Enter the leverage (e.g. 1x, 5x, 20x): "))

deployed_capital = stop_loss_dollar / (stop_loss_percent / 100) / leverage

print("The capital to deploy for the trade with leverage {} is: $".format(leverage,), deployed_capital)
