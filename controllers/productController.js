import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function getProducts(req,res){
    try{
        if(isAdmin(req)){
            const products = await Product.find();
            res.status(200).json(products);
        }else{
            const products = await Product.find({isAvailable : true})
            res.json(products)
        }
        
    }
    catch(err){
        res.json({
            message:"Error fetching products"
        })
    }
}

export function saveProducts(req,res){

    if(!isAdmin(req)){
        return res.status(403).json({
            message:"Unauthorized you need to be an admin to create a product"
        })
    }
    
    console.log(req.body);

    const product =new Product(
    req.body
);

    product.save().
    then(()=>
    {
        res.json({
            message:"Product added successfully"
        }
        )
    })
    .catch((err) => {
    console.error("Error saving product:", err.message); // log in terminal
    res.status(500).json({
        message: "Error adding product",
        error: err.message
    });
});
}

export async function deleteProducts(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:"Unauthorized you need to be an admin to delete a product"
        })
        return
    }
    try{
        await Product.deleteOne({productId : req.params.productId})

        res.json({
            message:"Product deleted successfully"
        })
    }catch(err){
        res.status(500).json({
            message: "Error deleting product",
            error: err.message
        });
    }
}

export async function updateProducts(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:"Unauthorized you need to be an admin to update a product"
        })
        return
    }
    const productId = req.params.productId;
    //what need to update
    const updatingData= req.body

    try{
        await Product.updateOne(
            {productId:productId},
            updatingData
        )
        res.json({
            message:"Product updated successfully"
            })

    }catch(err){
        res.status(500).json({
            message: "Error updating product",
            error: err.message
        }); 
    }
}

export async function getProductById(req,res){
    const productId = req.params.productId;

    try{
        const product = await Product.findOne({
            productId:productId
        })
        if(product==null){
            res.status(404).json({
                message:"Product not found"
            })
            return
        }
        if(product.isAvailable){
            res.json(product)
        }else{
            if(!isAdmin(req)){
                res.status(403).json({
                    message:"Unauthorized you need to be an admin to view this product"
                })
                return
            }
            else{
                res.json(product)
            }
        }

    }
    catch(err){
        res.status(500).json({
            message: "Error fetching product",
            error: err.message
        });

    }

}