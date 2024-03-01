const findTotalOrders = async () => {
    try{
        const response = await axios.get('/api/totalorders')
        const orders = response.data
        let totalOrders = document.querySelector(".total-orders")
        let findTotalOrders = orders.length;
        totalOrders.innerHTML = findTotalOrders
    } catch(error){
        console.log(error)
    }
}

findTotalOrders()