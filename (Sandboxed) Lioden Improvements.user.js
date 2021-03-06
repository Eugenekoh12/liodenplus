// Generated by CoffeeScript 1.9.3

/* UserScript options {{{1
See http://wiki.greasespot.net/Metadata_Block for more info.

// ==UserScript==
// @name         (Sandboxed) Lioden Improvements
// @description  Adds various improvements to the game Lioden. Sandboxed portion of the script.
// @namespace    ahto & Eugenekoh12
// @version      9.1.2
// @include      https://*.lioden.com/*
// @include      https://lioden.com/*
// @require      https://raw.githubusercontent.com/bluMyst/FlightRisingUserscripts/master/ahtoLib.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
 */

/* Features and changes {{{1
General:
- Made the second-to-top bar a little slimmer.
- Added significantly more quickly-accessible links, and made the site overall faster and easier to use.

Hunting:
- Automatically reloads and flashes the tab when your hunt is finished.

Den:
- Can automatically play with all lionesses.
- Table order slightly tweaked.

Lion view:
- Can see lion name and picture right next to the chase buttons.
 */
var HUMAN_TIMEOUT_MAX, HUMAN_TIMEOUT_MIN, HUNT_BLINK_TIMEOUT, LionPlayer, aboutKing, aboutPlayer, blinker, chaseButtonTable, currentKingID, energyBar, energyBarBar, energyBarChangeBar, energyBarText, energyUpdate, etc, getResults, i, item, items, j, kingID, kingPortraitHref, len, lionImageClone, logout, minutesLeft, moveToToplinks, namePlateClone, navbar, newDropdown, newNavbarItem, pride, ref, ref1, setHumanTimeout, storedKingID, tables, toplinks, wait,
  slice = [].slice;

HUNT_BLINK_TIMEOUT = 500;

HUMAN_TIMEOUT_MIN = 200;

HUMAN_TIMEOUT_MAX = 1000;

GM_addStyle("/* Make the top bar slimmer. */\n.main { margin-top: 10px; }\n\n/*\n * Remove the Lioden logo since I can't figure out how to shrink it,\n * and it's taking up too much space on the page. It overlaps the veeery\n * top bar, with the link to the wiki and forums and stuff.\n *\n * TODO: Figure out how to just shrink it instead of flat-out removing it.\n */\n.navbar-brand > img { display: none; }");

setHumanTimeout = function(f) {
  return setTimeout_(randInt(HUMAN_TIMEOUT_MIN, HUMAN_TIMEOUT_MAX), f);
};

energyBar = $('div.progress:first');

energyBarText = energyBar.find('div:last');

energyBarText.css('z-index', '2');

energyBarBar = energyBar.find('div:first');

energyBarBar.css('z-index', '1');

energyBarChangeBar = $("<div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 0%; background: #afc7c7;\" />");

energyBar.append(energyBarChangeBar);

energyUpdate = function() {
  var e, energyPercent, energyUpdateTime, minutes, now;
  try {
	energyPercent = /Energy: ([0-9]+)%/.exec(energyBarText.text())[1];
  } catch (_error) {
	e = _error;
	if (e instanceof TypeError) {
	  console.log("Unable to read energy percent from " + energyBar);
	  console.log('Disabling energyUpdate');
	  return;
	} else {
	  throw e;
	}
  }
  energyPercent = parseInt(energyPercent);
  now = new Date(Date.now());
  minutes = now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / (1000 * 60);
  energyUpdateTime = new Date(now);
  console.log("now: " + now);
  console.log("minutes: " + minutes);
  energyUpdateTime.setSeconds(0);
  energyUpdateTime.setMilliseconds(0);
  if ((0 <= minutes && minutes < 15)) {
	console.log("0 <= minutes < 15");
	energyUpdateTime.setMinutes(15);
  } else if ((15 <= minutes && minutes < 30)) {
	console.log("15 <= minutes < 30");
	energyUpdateTime.setMinutes(30);
  } else if ((30 <= minutes && minutes < 45)) {
	console.log("30 <= minutes < 45");
	energyUpdateTime.setMinutes(45);
  } else if (45 <= minutes) {
	console.log("45 <= minutes");
	energyUpdateTime.setMinutes(0);
	energyUpdateTime.setHours(now.getHours() + 1);
  }
  console.log("Target time for energy refresh is:", energyUpdateTime);
  console.log("That means we're waiting for " + ((energyUpdateTime - now) / (1000 * 60)) + " minutes.");
  return setTimeout_(energyUpdateTime - now, function() {
	if (energyPercent + 10 <= 100) {
	  energyPercent += 10;
	} else if (energyPercent < 100) {
	  console.log("Setting energyPercent to 100, from " + energyPercent);
	  energyPercent = 100;
	}
	energyBarText.text("Energy: " + energyPercent + "%");
	energyBarChangeBar.css("width", energyPercent + "%");
	if (energyPercent <= 100) {
	  return energyUpdate();
	} else {
	  return console.log('energyPercent is > 100 so stopping energy update loop.');
	}
  });
};

energyUpdate();

navbar = $('.nav.visible-lg');

toplinks = $('.toplinks');

logout = toplinks.find('a[href="/logout.php"]');

moveToToplinks = function(page, linkText) {
  var link;
  link = navbar.find("a[href='" + page + "']").parent();
  link.remove();
  link.find('a').text(linkText);
  return logout.before(link);
};

moveToToplinks('/oasis.php', 'Oasis');

moveToToplinks('/boards.php', 'Chatter');

moveToToplinks('/news.php', 'News');

moveToToplinks('/event.php', 'Event');

moveToToplinks('/faq.php', 'FAQ');

GM_addStyle ( "  \
	.navbar-nav>li>a {  \
		padding: 10px !important;  \
	}  \
	ul li ul.dropdown {  \
		background: " + ($('.navbar.navbar-default').css('background')) + ";  \
		padding-left: 10px;  \
		padding-right: 10px;  \
		padding-bottom: 5px;  \
		display: none;  \
		position: absolute;  \
		z-index: 999;  \
		left: 0;  \
	}  \
	ul li ul.dropdown li {  \
		display: inline-block;  \
		white-space: nowrap;  \
		min-width: 100px;  \
	}  \
	/* Display the dropdown on hover. */  \
	ul li:hover ul.dropdown {  \
		display: inline-block;  \
	}  \
" );

newDropdown = function(menuItem, dropdownLinks) {
  var dropdown, j, len, link, linkText, ref, results;
  if (typeof menuItem === 'string') {
	menuItem = navbar.find("a[href='" + menuItem + "']").parent();
  }
  dropdown = $("<ul class=dropdown></ul>");
  menuItem.append(dropdown);
  results = [];
  for (j = 0, len = dropdownLinks.length; j < len; j++) {
	ref = dropdownLinks[j], link = ref[0], linkText = ref[1];
	results.push(dropdown.append("<li><a href='" + link + "'>" + linkText + "</a></li>"));
  }
  return results;
};

newNavbarItem = function(page, linkText, dropdownLinks) {
  var navbarItem;
  navbarItem = $("<li><a href='" + page + "'>" + linkText + "</a></li>");
  navbar.append(navbarItem);
  if (dropdownLinks != null) {
	return newDropdown(navbarItem, dropdownLinks);
  }
};

if ((kingID = GM_getValue('kingID')) != null) {
  newDropdown('/territory.php', [["/lion.php?mid=" + kingID, 'King Overview'], ["/lionoverview.php?id=" + kingID, 'Lion Overview'], ['/nesting.php', 'Nesting'], ['/territory_map.php', 'Territories']]);
}

newDropdown('/hoard.php', [['/hoard-overview.php','Overview'], ['/hoard.php?type=Food', 'Food'], ['/hoard.php?type=Amusement', 'Amusement'], ['/hoard.php?type=Beetle%20Skin', 'Beetle Skin'], ['/hoard.php?type=Custom%20Decoration', 'Custom Decoration'], ['/hoard.php?type=Decoration', 'Decoration'], ['/hoard.php?type=Background', 'Background'], ['/hoard.php?type=Crafting', 'Crafting'], ['/hoard.php?type=Other', 'Other'], ['/hoard.php?page=Buried', 'Buried'], ['/hoard.php?page=Expiring', 'Expiring'], ['/hoard.php?page=Bundles', 'Bundles'], ['/hoard-organisation.php', 'Organisation'], ['/hoard.php?page=create-bag', 'Create Goodie Bag']]);

newDropdown('/explore.php', [['/givingtree.php', 'The Giving Tree'], ['/search.php', 'Search'], ['/trading_center.php', 'Trading Center'], ['/clans.php', 'Clans'], ['/questing.php', 'Quests'], ['/monkeybusiness.php', 'Monkey Business']	, ['/games.php', 'Games'], ['/leaders.php', 'Leaderboards'], ['/special.php', 'Raffle Lioness'], ['/personalitysnake.php', 'Personality Snake']]);

newNavbarItem('/hunting.php', 'Hunting');

newNavbarItem('/patrol.php', 'Patrol');

newNavbarItem('/exploring.php', 'Exploring', [['/explorearea.php?id=1', 'Temperate Savannah (Lvl 1)'], ['/explorearea.php?id=2', 'Shrubland (Lvl 2-5)'], ['/explorearea.php?id=3', 'Tropical Forest (Lvl 6-10)'], ['/explorearea.php?id=4', 'Dry Savannah (Lvl 11-15)'], ['/explorearea.php?id=5', 'Rocky Hills (Lvl 16-20)'], ['/explorearea.php?id=6', 'Arid Desert (Lvl 21-25)'], ['/explorearea.php?id=7', 'Marshlands (Lvl 26-30)'], ['/explorearea.php?id=8', 'Waterhole (Lvl 31+)']]);

newNavbarItem("/lionoverview.php?id=" + kingID, 'Cubs', [['/cubtraining.php', 'Training'], ['/gorilla-enclave.php', 'Gorilla Enclave']]);

newNavbarItem('/branch.php', 'Branches', [['/branch.php', 'My Branch'], ['/search_branches.php', 'Branch Sales']]);

newNavbarItem('/hoard.php', 'Beetles', [['/beetlegrounds.php', 'Beetle Grounds'], ['/battlebeetles.php', 'Battle Beetles']]);

newNavbarItem('/scryingstone.php', 'Scrying Stone', [['/wardrobe.php', 'Wardrobe'], ['/falcons-eye.php', "Falcon's Eye"]]);

if (urlMatches(new RegExp('/hunting\\.php', 'i'))) {
  minutesLeft = findMatches('div.center > p', 0, 1).text();
  getResults = findMatches('input[name=get_results', 0, 1);
  if (minutesLeft.length) {
	minutesLeft = (/([0-9]+) minutes/.exec(minutesLeft))[1];
	minutesLeft = safeParseInt(minutesLeft);
	console.log(minutesLeft, 'minutes remaining.');
	wait = (minutesLeft + 1) * 60 * 1000;
	console.log("Reloading in " + wait + " ms...");
	setTimeout_(wait, function() {
	  return location.reload();
	});
  } else if (getResults.length) {
	blinker = setInterval((function() {
	  if (document.title === 'Ready!') {
		return document.title = '!!!!!!!!!!!!!!!!';
	  } else {
		return document.title = 'Ready!';
	  }
	}), HUNT_BLINK_TIMEOUT);
	window.onfocus = function() {
	  clearInterval(blinker);
	  return document.title = 'Ready!';
	};
  }
}

if (urlMatches(new RegExp('/lion\\.php', 'i'))) {
  namePlateClone = findMatches('h1', 1, 1).clone();
  lionImageClone = findMatches('center > div[style="width: 95%; overflow: auto;"]', 1, 1).clone();
  chaseButtonTable = findMatches('div.col-xs-12.col-md-4', 1, 1);
  chaseButtonTable.before(namePlateClone, lionImageClone, '<br>');
}

if (urlMatches(new RegExp('/territory\\.php', 'i'))) {
  if (!(urlMatches(/[?&]id=/i))) {
	storedKingID = GM_getValue('kingID');
	console.log("storedKingID: " + storedKingID);
	kingPortraitHref = $('#lion_image').parent().attr('href');
	console.log("kingPortraitHref: " + kingPortraitHref);
	currentKingID = /\/lion\.php\?mid=([0-9]+)/.exec(kingPortraitHref)[1];
	if (currentKingID !== storedKingID) {
	  console.log("Stored king ID '" + storedKingID + "' didn't match detected kingID '" + currentKingID + "' at URL '" + document.location.href + "'");
	  GM_setValue('kingID', currentKingID);
	}
	GM_addStyle("/* Make the tables a little closer together. Website default 20px. */\n.table { margin-bottom: 10px; }");
	tables = $('div.container.main center table.table');
	ref = (function() {
	  var j, len, results;
	  results = [];
	  for (j = 0, len = tables.length; j < len; j++) {
		i = tables[j];
		results.push($(i));
	  }
	  return results;
	})(), aboutKing = ref[0], aboutPlayer = ref[1], pride = ref[2], etc = 4 <= ref.length ? slice.call(ref, 3) : [];
	aboutKing.after(pride);
	LionPlayer = (function() {
	  var lionPlayer;

	  LionPlayer.prototype.LION_URL_TO_ID = new RegExp('/lion\\.php.*[?&]id=([0-9]+)');

	  function LionPlayer(autoPlayLink) {
		this.autoPlayLink = autoPlayLink;
		this.lionIDs = [];
		this.safeToClick = true;
		this.autoPlayLink.click((function(_this) {
		  return function() {
			return _this.clickListener();
		  };
		})(this));
	  }

	  LionPlayer.prototype.clickListener = function() {
		if (this.safeToClick) {
		  this.safeToClick = false;
		  this.updateLionIDs();
		  return this.play();
		}
	  };

	  LionPlayer.prototype.getLionID = function(lionLink) {
		var id, url;
		url = lionLink.attr('href');
		id = this.LION_URL_TO_ID.exec(url)[1];
		return id;
	  };

	  LionPlayer.prototype.updateLionIDs = function() {
		var lionLinks;
		lionLinks = $('a[href^="/lion.php?id="]');
		return this.lionIDs = (function() {
		  var j, len, results;
		  results = [];
		  for (j = 0, len = lionLinks.length; j < len; j++) {
			i = lionLinks[j];
			results.push(this.getLionID($(i)));
		  }
		  return results;
		}).call(this);
	  };

	  LionPlayer.prototype.play = function(arg, playedWith, length) {
		var id, ids, recurse, ref1;
		ref1 = arg != null ? arg : this.lionIDs, id = ref1[0], ids = 2 <= ref1.length ? slice.call(ref1, 1) : [];
		if (playedWith == null) {
		  playedWith = 0;
		}
		if (length == null) {
		  length = ids.length + 1;
		}
		this.autoPlayLink.text("Loading... (" + playedWith + "/" + length + ")");
		recurse = (function(_this) {
		  return function() {
			playedWith++;
			if (ids.length) {
			  return setHumanTimeout(function() {
				return _this.play(ids, playedWith, length);
			  });
			} else {
			  return _this.autoPlayLink.text("Done! (" + playedWith + "/" + length + ")");
			}
		  };
		})(this);
		return $.get("/lion.php?id=" + id).done((function(_this) {
		  return function(response) {
			if ($(response).find('input[value=Interact]').length) {
			  return $.post("/lion.php?id=" + id, {
				action: 'play',
				interact: 'Interact'
			  }).done(function(response) {
				console.log("Played with " + id + " successfully.");
				return recurse();
			  });
			} else {
			  console.log("Couldn't play with " + id + "; probably on cooldown.");
			  return recurse();
			}
		  };
		})(this));
	  };

	  $('th a[href^="/lionoverview.php"]').parent().after("<th style=\"text-align:center!important;\"><a href=\"javascript:void(0)\" id=autoPlay>Play with all.</a></th>");

	  lionPlayer = new LionPlayer($('#autoPlay'));

	  return LionPlayer;

	})();
  }
  findMatches('h1 + br', 1, 1).remove();
}

if (urlMatches(/\/branch\.php/i)) {
  items = $('div.item');
  ref1 = (function() {
	var k, len, ref1, results;
	ref1 = items.find('b');
	results = [];
	for (k = 0, len = ref1.length; k < len; k++) {
	  i = ref1[k];
	  results.push($(i));
	}
	return results;
  })();
  for (j = 0, len = ref1.length; j < len; j++) {
	item = ref1[j];
	if (!(/[SG]B:/.exec(item.text()))) {
	  continue;
	}
	item.wrap("<a href=\"javascript:void(0)\"></a>");
	item.parent().click(function(event) {
	  var a, itemName, k, len1, ref2, results, targetItem;
	  console.log('Got click event:', event);
	  a = $(event.currentTarget);
	  targetItem = a.parents('div.item');
	  console.log('targetItem:', targetItem);
	  itemName = targetItem.find('div.item-header').text();
	  console.log('itemName:', itemName);
	  ref2 = (function() {
		var l, len1, results1;
		results1 = [];
		for (l = 0, len1 = items.length; l < len1; l++) {
		  i = items[l];
		  results1.push($(i));
		}
		return results1;
	  })();
	  results = [];
	  for (k = 0, len1 = ref2.length; k < len1; k++) {
		i = ref2[k];
		if (!(i.find('div.item-header').text() === itemName)) {
		  continue;
		}
		i.find('input[name="price[]"]').val(targetItem.find('input[name="price[]"]').val());
		results.push(i.find('input[name="cprice[]"]').val(targetItem.find('input[name="cprice[]"]').val()));
	  }
	  return results;
	});
  }
}
