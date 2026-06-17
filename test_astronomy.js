import * as Astronomy from 'astronomy-engine';

const date = new Date();
try {
  const moonHelio = Astronomy.HelioVector(Astronomy.Body.Moon, date);
  console.log("Moon helio vector:", moonHelio);
} catch (e) {
  console.log("Error:", e.message);
}
