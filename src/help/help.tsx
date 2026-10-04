import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitleWithClose from '../dialog/dialog.title';
import './help.scss';

export default function Help({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onClose={onClose} scroll="paper" maxWidth="md" className="Help">
      <DialogTitleWithClose onClose={onClose}>How to use Astroffers</DialogTitleWithClose>
      <DialogContent dividers>
        <div className="running-text">
          <p>
            Astroffers helps you to discover the objects of the NGC 2000 catalog. Along with your filter it lists the
            objects that are visible on the chosen night at your location. The list is recalculated automatically
            whenever you change the filter.
          </p>

          <h3>Filter</h3>
          <p>
            On a wide screen the filter is on the left side, the menu button of the header hides and shows it; on a
            phone it opens with the menu button.
          </p>
          <ul>
            <li>
              <b>Night of:</b> the night starting on the selected date.
            </li>
            <li>
              <b>Location:</b> search for a place, type its coordinates, or use the location of your device.
            </li>
            <li>
              <b>Minimum observation time:</b> how long an object should be visible during the night at least.
            </li>
            <li>
              <b>Maximum altitude of the Sun:</b> how deep the Sun should dive below the horizon to start the
              astronomical night. <code>-18°</code> by default; <code>0°</code> means that the night starts right after
              sunset.
            </li>
            <li>
              <b>Minimum altitude of objects:</b> objects not rising above this altitude during the night are left out.{' '}
              <code>20°</code> by default.
            </li>
            <li>
              <b>Moonless night only:</b> leaves out the part of the night when the Moon is above the horizon.
            </li>
            <li>
              <b>Maximum brightness:</b> filters by the maximum magnitude or surface brightness. The surface brightness
              is computed from the magnitude and the size, so objects without size data are left out by it.
            </li>
            <li>
              <b>Object types and constellations:</b> select the kinds of objects and the constellations you are
              interested in.
            </li>
          </ul>

          <h3>Summary</h3>
          <p>
            The summary shows the number of results, the phase of the Moon and the times of the night. The clock face
            shows the whole day from noon to the next noon:
          </p>
          <ul>
            <li>
              <span className="dot daylight" /> daytime
            </li>
            <li>
              <span className="dot twilight" /> twilight
            </li>
            <li>
              <span className="dot moonNight" /> astronomical night while the Moon is up
            </li>
            <li>
              <span className="dot moonlessNight" /> moonless astronomical night
            </li>
          </ul>
          <p>The result list can be exported to a CSV file from the summary.</p>

          <h3>Calendar</h3>
          <p>
            The calendar button of the header shows the nights of a whole month at the chosen location: the phase of the
            Moon and a strip of every day from midnight to midnight with the same colors as the clock face. The
            astronomical night follows the maximum altitude of the Sun of the filter. Click a day to see the times of
            its night, and <b>Show objects</b> to list the objects of that night.
          </p>

          <h3>Result list</h3>
          <p>
            Every object shows its visibility interval (<b>From</b> – <b>To</b>), its best visibility with the related
            altitude (<b>Max / Alt</b>) and the length of the visibility (<b>Sum</b>). The list is sorted by the best
            visibility by default; click a header (or use the sort selector on a phone) to sort otherwise. Objects can
            be searched by their NGC number, Messier number and name; <code>*</code> in the Messier or the name search
            lists every object that has a Messier number or a name.
          </p>

          <h3>Details</h3>
          <p>
            Click an object to see its details: a preview image from the DSS2 survey, its coordinates, rising, setting
            and transit, an <b>altitude chart</b> from noon to the next noon, and a <b>polar chart</b> of its path on
            the sky, where the distance from the center is the distance from the zenith. A full circle means that the
            object is circumpolar. Step to the previous or next object with the buttons or the arrow keys.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
