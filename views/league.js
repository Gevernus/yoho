export function init(entity) {
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