

let isAnimating = false;
let pullDeltaX = 0; // distancia que la card se esta arrastrando
const DECISION_THRESHOLD = 150; // distancia minima para tomar una decision
let prevCard = null;

function likeNotLike(like){
    // get the first article element
    console.log({like})
    const cards = document.querySelectorAll('article');
    // get cards with display none
    const visibleCards = Array.from(cards).filter(card => card.hidden === false);
    const actualCard = visibleCards[visibleCards.length - 1];
    actualCard.querySelector(like ? '.choice.like' : '.choice.nope').style.opacity = 1;

    setTimeout(() => {
        actualCard.classList.add(like ? 'go-right' : 'go-left');
        actualCard.addEventListener('transitionend', () => {
            prevCard = actualCard;
            actualCard.hidden = true;
        }, { once: true });
    }, 800);
}

function undoCard(){
    prevCard.hidden = false;
    setTimeout(() => {
        prevCard.classList.add('reset');
        prevCard.classList.remove('go-left', 'go-right');
        prevCard.querySelector('.choice.like').style.opacity = 0;
        prevCard.querySelector('.choice.nope').style.opacity = 0;
        isAnimating = false;
        pullDeltaX = 0;
        prevCard.addEventListener('transitionend', () => {
            prevCard.removeAttribute('style');
            prevCard.classList.remove('reset');
            prevCard = null;
        }, { once: true });
    }, 20);
}

function startDrag(event){
    if(isAnimating) return;

    // get the first article element
    const actualCard = event.target.closest('article');
    if(!actualCard) return;

    // get initial position of mouse of finger
    const initialX = event.pageX || event.touches[0].pageX;

    // listen the mouse and touch movements
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd)

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd), { passive: false };

    function onMove(event){
        // current position of mouse or finger
        const currentX = event.pageX || event.touches[0].pageX;
        // the distinace between the initial and current position
        pullDeltaX = currentX - initialX;
        // no hay distancia recorrida
        if(pullDeltaX === 0) return;

        isAnimating = true;
        // calculate the rotation using the distance
        const deg = pullDeltaX / 10;
        // apply transformation
        actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;
        actualCard.style.cursor = 'grabbing';

        const opacity = Math.abs(pullDeltaX) / 100;
        const isRight = pullDeltaX > 0;

        const choiceEl = isRight ? actualCard.querySelector('.choice.like') : actualCard.querySelector('.choice.nope');
        choiceEl.style.opacity = opacity;
    }

    function onEnd(event){
        // remove events
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);

        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        // saber si el usuario tomo una decision
        const decisionMade = Math.abs(pullDeltaX) > DECISION_THRESHOLD;

        if(decisionMade){
            const goRight = pullDeltaX >= 0;
            const goLeft = !goRight;

            // add class acording to decision
            actualCard.classList.add(goRight ? 'go-right' : 'go-left');
            actualCard.addEventListener('transitionend', () => {
                actualCard.hidden = true;
            }, { once: true });
        } else {
            // return to initial position
            actualCard.classList.add('reset');
            actualCard.classList.remove('go-left', 'go-right');
        }

        // reset variables
        actualCard.addEventListener('transitionend', () => {
            actualCard.removeAttribute('style');
            actualCard.classList.remove('reset');
            isAnimating = false;
            pullDeltaX = 0;
        });
        // reset the choice info opacity
        actualCard
        .querySelectorAll(".choice")
        .forEach((el) => (el.style.opacity = 0));
    }
}


document.addEventListener('mousedown', startDrag);
document.addEventListener('touchstart', startDrag, { passive: true }); // el passive lo pone en segundo plano para que no se bloquee el evento