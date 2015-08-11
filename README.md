# TagPro Stats Player Chart

Add a radar/bar chart to http://tagpro-stats.com profiles. Good for quickly comparing yourself against other players.

![Full page](/images/page.png?raw=true)

## Install

CLICK HERE: **https://keratagpro.github.io/tagpro-stats-player-chart/tagpro-stats-player-chart.user.js**

(requires [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en))

## Features

* Select between radar and bar chart
* Toggle career and monthly stats
* Select and reorder chart stats
* Toggle between showing ranks and global max stats in the stat tables
* Store stats of current profile to overlay them against other profiles
* Changes to settings are saved automatically

## Examples

Radar chart

![Radar chart](/images/radar-chart.png?raw=true)

Bar chart

![Bar chart](/images/bar-chart.png?raw=true)

Radar chart comparing two players

![Radar chart comparison](/images/career-comparison.png)

Selectable chart stats; Ranks replaced with global max stats

![Max stats](/images/max-stats.png?raw=true)

Settings

![Settings](/images/settings.png?raw=true)

## Notes

* Stats where smaller is better: drops, drops/game, drops/hour, popped, pops/game, pops/hour, disconnects
* Max stats are the all-time stats of all players that have played >100 games.
* "Settings" link appears on hover.
* "Reset All" deletes your local changes to the settings.

### Development

Install dependencies:

    $ npm install

Scrape minimum/maximum stats from tagpro-stats.com into `src/lib/statLimits.js`:

    $ gulp update-stats

Bump project version:

	$ gulp bump

Build the project into `dist/`:

    $ gulp
    (same as running 'gulp meta' and 'gulp build')

Push the `dist/` folder into github's `gh-pages` branch:

    $ gulp deploy
