# TagPro Stats Player Chart

Add a radar/bar chart to http://tagpro-stats.com profiles. Good for quickly comparing yourself against other players.

![Full page](/images/page.png)

## Install

CLICK HERE: **https://keratagpro.github.io/tagpro-stats-player-chart/tagpro-stats-player-chart.user.js**

(requires [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en))

## Features

* Select between radar and bar chart
* Toggle career and monthly stats
* Select and reorder chart stats
* Toggle between showing ranks and global max stats in the stat tables
* Changes to settings are saved automatically

## Examples

Radar chart

![Radar chart](/images/radar-chart.png)

Bar chart

![Bar chart](/images/bar-chart.png)

Selectable chart stats; Ranks replaced with global max stats

![Max stats](/images/max-stats.png)

Settings

![Settings](/images/settings.png)

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

Build the project into `dist/`:

    $ gulp

Push the `dist/` folder into github's `gh-pages` branch:

    $ gulp deploy
