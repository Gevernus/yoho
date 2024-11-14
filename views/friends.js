export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const inviteButton = document.getElementById("invite-link-button");
    inviteButton.addEventListener("click", () => {
        shareInviteLink(entity);
    });
    const referralsComponent = entity.getComponent('ReferralsComponent');
    populateFriends(referralsComponent.items);
};

async function claim(userId, referralId) {
    try {
        const response = await fetch(`api/${userId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            json: { referralId: referralId },
        });
        if (!response.ok) {
            throw new Error('Failed to save state');
        }
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function generateInviteLink(userId, appURL) {
    const params = `${userId}`;
    return `${appURL}?startapp=${encodeURIComponent(params)}`;
}

function shareInviteLink(entity) {
    const userComponent = entity.getComponent('UserComponent');
    const inputComponent = entity.getComponent('InputComponent');
    const userId = userComponent.user.id;
    let inviteLink = generateInviteLink(userId, 'https://t.me/yoho_nw_bot/YOHO');
    inputComponent.addInput("openLink", {
        url: inviteLink
    });
}

function populateFriends(friends) {
    const friendsContainer = document.getElementById('friends-users');
    friendsContainer.innerHTML = ''; // Clear any existing content

    friends.forEach(friend => {
        // Create the main container div
        const friendDiv = document.createElement('div');
        friendDiv.className = 'friends-user';

        // Create the friends-info div
        const infoDiv = document.createElement('div');
        infoDiv.className = 'friends-info';

        // Create the friends-name div
        const nameDiv = document.createElement('div');
        nameDiv.className = 'friends-name';
        nameDiv.textContent = friend.name;

        // Create the friends-coin div
        const coinDiv = document.createElement('div');
        coinDiv.className = 'friends-coin';

        // Create the coin image
        const coinImg = document.createElement('img');
        coinImg.className = 'task-coin';
        coinImg.src = 'images/mini-coin.svg';
        coinImg.alt = '';

        // Create the coin span
        const coinSpan = document.createElement('span');
        // coinSpan.textContent = `${friend.coins.toLocaleString()}/${friend.totalCoins.toLocaleString()}`;
        coinSpan.textContent = `${"0"}/${"100000"}`;

        // Append the image and span to the coinDiv
        coinDiv.appendChild(coinImg);
        coinDiv.appendChild(coinSpan);

        // Append the nameDiv and coinDiv to the infoDiv
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(coinDiv);

        // Create the friends-photo img
        const photoImg = document.createElement('img');
        photoImg.className = 'friends-photo';
        photoImg.src = `https://t.me/i/userpic/320/${friend.username}.jpg`;
        photoImg.alt = 'avatar';

        // Append the infoDiv and photoImg to the friendDiv
        friendDiv.appendChild(infoDiv);
        friendDiv.appendChild(photoImg);

        // Append the friendDiv to the friendsContainer
        friendsContainer.appendChild(friendDiv);
    });
}

export function render(entity) {
};