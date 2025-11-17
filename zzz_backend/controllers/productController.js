import Product from "../models/product";

export async function getProducts(req,res){
    try{
        if(isAdmin(req)){
            const products = await Product.find();
            res.status(200).json(products);
        }else{
            const products = await Product.find({isAvailable:true})
            res.json(products);
        }
    }

    catch(err){
        res.json({
            message:"error fetching products"
        })
    }
}

export async function saveProducts(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:'unauthorized access'
        })
    }
    console.log(req.body);
     const product =  new Product(
        req.body
     );

    product.save()
    .then(()=>
    {
        res.json({
            message:'Product added successfully'
        })
    })
    .catch((err)=>{
        res.status(500).json({
            message:'Error adding product',
            error: err.message
        })
    })
}

export async function deleteProducts(res,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:'need to be admin to perform this action'
        })
        return
}
    try{
        await Product.deleteOne({productId : req.params.productId})

        res.json({
            message: 'product deleted successfully'
        })
    }catch(err){
        res.status(500).json({
            message:'error deleting product',
            error: err.message
        })  
    }
}

export async function updateProducts(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:'need to be admin to perform this action'
        })
        return
    }

    const ProductId = req.params.productId;
    const updatingData = req.body;


    try{
        await Product.updateOne(
            {productId: ProductId},
            updatingData
        )
        res.json({
            message:'product updated successfully'
        })
    }catch(err){
        res.status(500).json({
            message:'error updating product',
            error: err.message
        })  
    }
}
export async function getProductById(req,res){
    const productId = req.params.productId;
    try{
        const product =await Product.findOne({
            productId:productId
        })
        if(product==null){
            res.status(404).json({
                message:"product not found"
            })  
            return
        }
        else{
            res.json(product);
        }
    }
    catch(err){
        res.status(500).json({
            message:"error fetching product",
            error: err.message
        })
    }
}