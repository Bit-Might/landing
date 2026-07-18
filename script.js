const gameCards = document.querySelectorAll(".game-card");
const descriptionDiv = document.getElementById("game-description");
const originalText = descriptionDiv.innerHTML;

gameCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
        descriptionDiv.textContent = card.getAttribute("data-description");
    });
    card.addEventListener("mouseleave", () => {
        descriptionDiv.innerHTML = originalText;
    });
});
