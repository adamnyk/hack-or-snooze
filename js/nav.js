"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
	console.debug("navAllStories", evt);
	hidePageComponents();
	$storiesLoadingMsg.show()
	await getAndShowStoriesOnStart();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	console.debug("navLoginClick", evt);
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Show submit form on click of "submit" */
function navSubmitStoryClick() {
	if ($allStoriesList.css("display") !== "none")
		$submitForm.slideToggle("fast");
	else {
		hidePageComponents();
		$allStoriesList.show();
		$submitForm.show();
	}
}
$body.on("click", "#nav-submit-story", navSubmitStoryClick);

/** Show favorites list on clik of "favorites" */
function navFavoritesClick() {
	hidePageComponents();
	putFavoritesOnPage();
	$favoritesList.show();
}
$navFavorites.on("click", navFavoritesClick);
/** When a user first logins in, update the navbar to reflect that. */

/** Show My Stories list on click of "My Stories" */
async function navMyStoriesClick() {
	await User.updateCurrentUser();
	hidePageComponents();
	putMyStoriesOnPage();
	$myStoriesList.show();
}
$navMyStories.on("click", navMyStoriesClick);
/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	console.debug("updateNavOnLogin");
	$navLogin.hide();
	$navLogOut.show();
	$navUserProfile.text(`${currentUser.username}`).show();
	$navUserLinks.show();
}
