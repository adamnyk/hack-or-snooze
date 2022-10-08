"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.hide();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showTrashBtn = false) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();

	// If user is logged in, show star
	const showStar = Boolean(currentUser);

	return $(`
      <li id="${story.storyId}">
	  	${showTrashBtn ? getTrashBtnHTML() : ""}
		${showStar ? makeStarHTML(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getTrashBtnHTML() {
	return '<i class="fa-regular fa-trash-can"></i>';
}

function makeStarHTML(story) {
	if (currentUser.favorites.some((s) => s.storyId === story.storyId)) {
		return '<i class="fa-solid fa-star"></i>';
	} else {
		return '<i class="fa-regular fa-star"></i>';
	}
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug("putStoriesOnPage");

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

/** Submits new story, adds to page */
async function submitNewStory(evt) {
	console.debug("submitNewStory");
	evt.preventDefault();

	const storyData = {
		author: $("#submit-author").val(),
		title: $("#submit-title").val(),
		url: $("#submit-url").val(),
	};

	await storyList.addStory(currentUser, storyData);
	await User.updateCurrentUser();

	// Updates storyList with most recent API data and displays on page
	getAndShowStoriesOnStart();

	// hide and reset form
	$("#submit-form").trigger("reset");
	$("#submit-form").slideUp("fast");
}

$("#submit-form").on("submit", submitNewStory);

/** Finds and returns story by searching storyList, myStories, and Favorites of currentUser */
function getStory(storyId) {
	let fromStoryList = storyList.stories.find((s) => s.storyId === storyId);
	let fromMyStories = currentUser.ownStories.find((s) => s.storyId === storyId);
	let fromFavorites = currentUser.favorites.find((s) => s.storyId === storyId);

	let story = fromStoryList || fromMyStories || fromFavorites;
	return story;
}

/******************************************************
 * My Stories page functionality
 */
/** Get list of My Stories, generate their HTML, and put on page */
function putMyStoriesOnPage() {
	$myStoriesList.empty();

	if (currentUser.ownStories.length === 0) {
		$myStoriesList.append("<h5>You have no stories!</h5>");
	} else {
		for (let story of currentUser.ownStories) {
			const $story = generateStoryMarkup(story, true);
			$myStoriesList.prepend($story);
		}
		$myStoriesList.show();
	}
}

/** Delete story from Own Stories on click of trash button */
async function trashBtnClick(evt) {
	console.debug("trashBtnClick");
	const $tgt = $(evt.target);
	const storyId = $tgt.closest("li").attr("id");
	const story = getStory(storyId);

	await currentUser.deleteStory(story);
	putMyStoriesOnPage();
}
$body.on("click", ".fa-trash-can", trashBtnClick);
/**************************************************
 * Functionality for favorites list and star/unstar a story
 */

/** Get list of favorites, generate their HTML, and put on page */
function putFavoritesOnPage() {
	$favoritesList.empty();

	if (currentUser.favorites.length === 0) {
		$favoritesList.append("<h5>No favorites added!</h5>");
	} else {
		for (let story of currentUser.favorites) {
			const $story = generateStoryMarkup(story);
			$favoritesList.prepend($story);
		}
	}
	$favoritesList.show();
}

async function starClick(evt) {
	console.debug("starClick");
	const $tgt = $(evt.target);
	const storyId = $tgt.closest("li").attr("id");
	const story = getStory(storyId);

	$tgt.first().toggleClass("fa-solid fa-regular");

	// check for presence of star to see if it is already favorited
	if ($tgt.hasClass("fa-solid")) {
		await currentUser.addFavorite(story);
	}
	if ($tgt.hasClass("fa-regular")) {
		await currentUser.removeFavorite(story);
		if ($favoritesList.css("display") !== "none") {
			putFavoritesOnPage();
		}
	}
}

$body.on("click", ".fa-star", starClick);
