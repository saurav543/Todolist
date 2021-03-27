const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const request = require("request");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public'));
mongoose.connect("mongodb+srv://Saurav:Ranjeet123@cluster0.vd6wf.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// schema for item
const itemSchema = {
    name: String,
};

// model for the item
const Item = mongoose.model("Item", itemSchema);

// default data for item schema
const drink = new Item({
    name: "tea",
});
const eat = new Item({
    name: "samosa",
});
const defaultItem = [eat, drink];

// create schema for the list
const listSchema = {
    name: String,
    itemlist: [itemSchema],
}

// create model of name List 
const List = new mongoose.model("List", listSchema);

// default homepage
app.get("/", function(req, res) {
    Item.find(function(err, item) {
            if (err) {
                console.log(err);
            } else {
                if (item.length == 0) {
                    Item.insertMany(defaultItem, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("insert successfully");
                        }
                    });
                    res.redirect("/");
                } else {
                    res.render('list', { 'listTitle': "Today", 'items': item });
                }
            }
        })
        // console.log(data);

});

// After form submition adding data  add in database tables
app.post('/', function(req, res) {
    var item = req.body.listItem;
    var listname = req.body.list;
    const data = new Item({
        name: item,
    })
    if (listname == "Today") {
        data.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listname }, function(err, foundlist) {
            foundlist.itemlist.push(data);
            foundlist.save();
            res.redirect("/" + listname);
        })
    }
});

// delete the item from different table
app.post("/delete", function(req, res) {
    const check = req.body.checkbox;
    const listname = req.body.list2;
    console.log(check);
    if (listname == "Today") {
        Item.deleteOne({ _id: check }, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("delete successfully");
                res.redirect('/');
            }
        })
    } else {
        List.findOneAndUpdate({ name: listname }, { $pull: { itemlist: { _id: check } } }, function(err, foundlist) {
            if (!err) {
                res.redirect("/" + listname);
            }
        })
    }
})

// generate new table list instance  dynamically 
app.get("/:place", function(req, res) {
    const customlist = _.capitalize(req.params.place);
    List.findOne({ name: customlist }, function(err, foundlist) {
        if (!err) {
            if (!foundlist) {
                const list = new List({
                    name: customlist,
                    itemlist: defaultItem,
                });
                list.save();
                // console.log("list does not exist");
                res.redirect("/" + customlist)
            } else {
                // console.log("list  exist");
                res.render('list', { 'listTitle': customlist, 'items': foundlist.itemlist });
            }
        }
    });
});
// path to about page
app.get("/about", function(req, res) {
        res.render('about');
    })
    // port on which server is running
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log("server start at port successfully");
});