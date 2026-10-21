import React from 'react';
import BolusCalculator from '../../BolusCalculator';

export default function BolusTab({
  glicemia,
  carbs,
  grassi,
  usaHackMoto,
  impostazioni,
  setImpostazioni
}) {
  return (
    <div className="space-y-6">
      <BolusCalculator
        glicemia={glicemia}
        carbs={carbs}
        grassi={grassi}
        usaHackMoto={usaHackMoto}
        impostazioni={impostazioni}
        setImpostazioni={setImpostazioni}
      />
    </div>
  );
}
