const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");
const app=express();


app.set('view engine',"ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const MONGO_URL="MONGOURL";
mongoose.connect(MONGO_URL, {
  useUnifiedTopology: true,
})
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((e) => {
      console.log('not connected');
 });

const itemsSchema={
    name:String 
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item ({
    name:"Welcome to your todolist!"
});
const item2=new Item({
    name:"Hit the + button to add a new item."
});

const item3=new Item({
    name:"<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema ={
    name:String,
    items:[itemsSchema]
}

const List =mongoose.model("List",listSchema);

app.get("/",function(req,res){
     
      Item.find({},function(err,foundItems){
        
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Success"); 
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle:"Today",newlistitems:foundItems});
        }
      });
});

app.post("/",function(req,res){
    let itemName=req.body.newItem;
    let listName=req.body.list;
    
    const item=new Item ({
        name:itemName
    });
    
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    let checkboxid=req.body.checkbox;
    let listName=req.body.listName;
    if(listName=="Today"){
        Item.findByIdAndRemove(checkboxid,function(err){
            console.log("successfully deleted");
            res.redirect("/");
        });
        
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxid}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
    
});

app.get("/:customListName",function(req,res){
    const customListName =_.capitalize(req.params.customListName) ;

    List.findOne({name:customListName},function(err,foundList){
         if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{listTitle:foundList.name,newlistitems:foundList.items});
            }
         }
    })


});

app.post("/work",function(req,res){
   let item=req.body.newItem;
   workitems.push(item);
   res.redirect("/work");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
    console.log("Server Started");
});  
