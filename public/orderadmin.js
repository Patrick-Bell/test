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

const findTotalOrdersRevenue = async () => {
    try {
        const response = await axios.get('/api/totalorders');
        const orders = response.data;

        let totalOrdersRevenue = document.querySelector(".total-order-value");

        // Assuming each order has a 'totalPrice' property, adjust accordingly based on your data structure
        const findTotalOrdersRevenueFigure = orders.reduce((total, order) => total + order.totalPrice, 0);

        totalOrdersRevenue.innerHTML = `£${(findTotalOrdersRevenueFigure / 100).toFixed(2)}`;

    } catch (error) {
        console.log(error);
    }
}

findTotalOrdersRevenue();

const findAverageOrderValue = async () => {
    try {
        const response = await axios.get('/api/totalorders');
        const orders = response.data;

        let averageOrderValue = document.querySelector(".average-order-value");

        // Assuming each order has a 'totalPrice' property, adjust accordingly based on your data structure
        const totalOrderValue = orders.reduce((total, order) => total + order.totalPrice, 0);
        const numberOfOrders = orders.length;

        const findAverageOrderValueFigure = numberOfOrders === 0 ? 0 : totalOrderValue / numberOfOrders;

        averageOrderValue.innerHTML = `£${(findAverageOrderValueFigure / 100).toFixed(2)}`;
    } catch (error) {
        console.log(error);
    }
}

findAverageOrderValue();




