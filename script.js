// Example: Handle form submission in the order page
document.getElementById("order-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const foodItem = document.getElementById("food-item").value;
    const quantity = document.getElementById("quantity").value;
    alert(`Order placed: ${quantity} ${foodItem}`);
});
