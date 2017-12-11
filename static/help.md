# How to use Astroffers

Astroffers helps you to discovering NGC objects. Accordingly to your filter options it shows those objects, which are visible on your choosen night and location.

## Filtering

The Filter panel is on the left side of the window. If you modify any value, you should press the `FILTER` button on the bottom of the panel to performing your changes.

### Date

Here you can select the night you are interested for and starts on the selected date.

By pressing `SET TODAY` button you can always return to the current day.

### Location

Here you can type your `Latitude` and `Longitude`.

#### Set location on map

By pressing `SELECT LOCATION` button you can choose your location manually on a map in the displayed dialog.

#### Use network location

Also in this dialog by pressing the `USE NETWORK LOCATION` button you will get a suggested position.

### Maximum altitude of Sun

This value defines the length of the twilight. It denotes the angle to how deep should the Sun dive below the horizont to start the astronomical night. The `0°` means, that the astronomical night starts immediately after sunset and ends immediately after sunrise. The default value is `-18°`.

### Minimum altitude of objects

This angle denotes the minimum altitude of NGC objects to filtering the results. The default value is `20°`. That means, that the result list will not display those objects, which will not rise above `20°` during the whole night.

### Moonless night only

By default Astroffers excludes that interval of the night, when the Moon is above the horizont. By switching off this toggle button, Astroffers will not care about the Moon's illumination, and shows the all of the results, which are observable during the night accordingly to the filter settings.

### Filtering brightness

There are two ways to filtering objects by their brightness. You can select one of them:

#### 1) Filter by magnitude

You can define the maximum value of magnitude. The result list will not display those objects, which do not reach this value.

#### 2) Filter by surface brightness

You can define the maximum value of surface brightness. The result list will not display those objects, which do not reach this value.

Notice that the surface brightness values of objects are calculated by their magnitude and size. If the size data is missing at an object, that will not displayed in the result list.

### Filtering types

By pressing the `FILTER TYPES` button, you can select to which type of objects are you interested for.

### Reseting

By pressing the `RESET` button you can always reset the Filter panel to the factory settings.

## Summary and night informations

The Summary panel is on the top of the window. It shows the

- Number of results
- Illumination / phase of the Moon
- Some data about the night
- A pie-chart about the brightness of the night

### The night table

In this table you can see some information about the night.

- **Sun:** The first row shows the sunset and sunrise. In this row the sunset denotes the time, when the Sun dives below the horizont. The sunrise denotes the time, when the Sun rises above the horizont.
- **Astro night:** The second row is consistent with the `Maximum altitude of Sun` value on the Filter panel. The astromical night starts when the Sun dives below this value, and ends when the Sun rises above this value.
- **Moon:** The third row shows the moonset and moonrise. The moonset denotes the time, when the Moon dives below the horizont, and the moonrise denotes the time, when the Moon rises above the horizont.
- **Moonless night:** In the fourth row the moonless night starts when the Sun is below the value of `Maximum altitude of Sun` and the Moon is below the horizont. The moonless night ends when the Sun is above the value of `Maximum altitude of Sun` or the Moon is above the horizont.

### The pie-chart of the night

This chart shows the brightness of the night. It displayes a whole day, that starts at noon (`12:00`) of the selected date and ends at the next day's noon (`12:00`).

- The light blue denotes the daytime.
- The dark blue denotes the astronomical twilight.
- The grey denotes the astronomical night when the Moon is up.
- The black denotes the moonless astronomical night.

## The result list

You can find the result list in the right side of the application. The result list corresponds with the filter settings after you pressed the `FILTER` button, and it shows the currently observable NGC objects with its observation interval and best visibility.

The result list contains the following columns:

- **NGC number**
- **Object type**
- **From and To:** The observation interval. If you turned on the `Moonless night only` switch, that is limited to the section of astronomical night, when the Moon is down. Otherwise it is limited only to the astronomical night independently from the Moon.
- **Max / Alt:** The time, when the object has the best visibility with the related altitude value.
- **Sum:** The length of the observation interval.
- **Magnitude**
- **Surface brightness:** This value is computed from the magnitude value and size data.

## The detailed view

If you click on any item in the result list, a popup window will be opened. That is the detailed view.
In this view, you can see more details of the object. On the bottom of the popup window, you can find two charts:

- The left one is an **Altitde chart** from the noon of the selected date to the next day's noon.
- The right one is an **Azimuth-Altitude polar chart**. This shows where the object rises and sets down. If you see here a circle, that means the object is circumpolar.