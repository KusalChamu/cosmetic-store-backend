import Order from "../models/order.js"
import Product from "../models/product.js"

export async function createOrder(req,res){
    //get user information
    //craete name of the user if not given
    //orderid generate
    //create order object

    if(req.user == null){
        res.status(403).json({
            message:"please login and try again"
        })
        return
    }

    const orderInfo = req.body

    if(orderInfo.name==null){
        orderInfo.name = req.user.firstName +" "+ req.user.lastName
    }

    //CBC00001

    let orderId = "CBC00001"

    //output is an array
    const lastOrder = await Order.find().sort({date:-1}).limit(1)

    if(lastOrder.length>0){
        const lastOrderId = lastOrder[0].orderId
        const lastOrderNumberString = lastOrderId.replace("CBC","")
        const lastOrderNumber = parseInt(lastOrderNumberString)
        const newOrderNumber = lastOrderNumber + 1
        const newOrderNumebrString = String(newOrderNumber).padStart(5,'0')//padding with zeroes to get length of 5
        orderId = "CBC" + newOrderNumebrString
    }

    
    try{

        let total =0 ;
        let labelledTotal =0;
        const products =[]

        for (let i=0;i<orderInfo.products.length;i++){
            const item =await Product.findOne({productId : orderInfo.products[i].productId})
            if(item==null) {
                res.status(404).json({
                    message:"product not found "+ orderInfo.products[i].productId
                })
                return
            }
        products[i]={
            productInfo:{
                productId : item.productId,
                name:item.name,
                altName:item.altName,
                description:item.description,
                images:item.images,
                labelledPrice:item.labelledPrice,
                price:item.price
            },
            quantity: orderInfo.products[i].qty
        }
        total = total + (item.price * orderInfo.products[i].qty)
        labelledTotal = labelledTotal + (item.labelledPrice * orderInfo.products[i].qty)

        }
        

        //only phone,address need to send
    const order = new Order({
        orderId : orderId,
        email :req.user.email,
        phone : orderInfo.phone,
        name : orderInfo.name,
        address : orderInfo.address,
        total:0,
        products:products,
        labelledTotal:labelledTotal,
        total:total
    })

        const createOrder=  await order.save()
        res.json({
            message:"order created successfully",
            orderId: createOrder
        })
    }catch(err){
        res.status(500).json({
            message:"error creating order",
            error: err.message
        })

    }

}