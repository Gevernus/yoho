export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });
    new Swiper('.swiper', {
        // Optional parameters
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,

        navigation: {
            nextEl: '#league-button-next',
            prevEl: '#league-button-back',
        },


    });
};

export function render(entity) {

}