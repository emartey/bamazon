var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",


    password: "",
    database: "Bamazon"

});

var cost = 0;
var total = 0;
var totalcount = 0;


function options() {


    connection.query('SELECT * FROM products', function (err, response) {
        if (err) throw err;
        console.log("What would you like to buy?");

        for (var i = 0; i < response.length; i++) {
            console.log("ID# " + response[i].itemid + " PRODUCT NAME: " + response[i].productname + " DEPARTMENT: " + response[i].departmentname + " PRICE: $" + response[i].price + " QUANTITY AVAILABLE: " + response[i].stockquantity);
        }
        inquirer.prompt([{
            type: 'input',
            name: 'itemid',
            message: "What is the ID number of the product you would like to buy? [Ctrl + C to exit]"

        }]).then(function (answer) {
            var itemid = parseInt(answer.itemid)


            for (var i = 0; i < response.length; i++) {
                if (response[i].itemid == answer.itemid) {
                    var result = response[i];
                    console.log('We have ' + result.stockquantity + ' ' + result.productname + ' in stock for $' + result.price + ' each');

                    inquirer.prompt([{
                        type: 'input',
                        name: 'itemQuantity',
                        message: 'How many ' + result.productname + ' would you like to buy?'

                    }]).then(function (answer) {
                        var quantity = parseInt(answer.itemQuantity);

                        if (quantity > result.stockquantity) {
                            console.log("Sorry we do not have enough available to fullfil your order. Please choose a lower quantity or select another item.");
                            inquirer.prompt([{
                                type: 'confirm',
                                name: 'shop',
                                message: "Is there anything else we can help you with?"

                            }]).then(function (answer) {
                                if (answer.shop) {
                                    options();
                                } else {
                                    console.log("Thank you for your business! We hope you come back soon.")
                                    connection.end();
                                }
                            })

                        } else {
                            console.log("Your total is:");

                            connection.query('UPDATE products SET stockquantity = stockquantity - ? WHERE itemid = ?', [quantity, itemid], function (err, response) {
                                if (err) throw err;
                            });

                            var cost = result.price;
                            var totalPrice = cost * quantity;
                            var totalPriceRound = Math.round(totalPrice * 100) / 100;
                            var tax = ((.875 / 10000) * 1000) * totalPrice;
                            var taxRound = Math.round(tax * 100) / 100;
                            var total = totalPriceRound + taxRound;



                            console.log("QUANTITY ORDERED: " + quantity + " " + result.productname + '  at ' + "$" + cost);
                            console.log("PRICE:  $" + totalPriceRound);
                            console.log("TAX @ 0.0875%: $" + taxRound);
                            console.log("TOTAL BALANCE:  $" + total);

                            inquirer.prompt([{
                                type: 'confirm',
                                name: 'shop',
                                message: "Is there anything else you would like to purchase?"

                            }]).then(function (answer) {
                                if (answer.shop) {
                                    options();
                                } else {
                                    console.log("Thank you for your business.")
                                    connection.end();
                                }
                            })

                        }
                    })
                }
            }
        })

    });
    //      
}
options();



