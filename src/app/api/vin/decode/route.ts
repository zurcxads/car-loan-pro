import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vin = searchParams.get('vin');

  if (!vin || vin.length !== 17) {
    return NextResponse.json(
      { error: 'VIN must be exactly 17 characters' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
    );

    if (!response.ok) {
      throw new Error('NHTSA API request failed');
    }

    const data = await response.json();
    const results = data.Results?.[0];

    if (!results) {
      return NextResponse.json(
        { error: 'Unable to decode VIN' },
        { status: 404 }
      );
    }

    const decoded = {
      year: results.ModelYear || '',
      make: results.Make || '',
      model: results.Model || '',
      trim: results.Trim || '',
      vehicleType: results.VehicleType || '',
      bodyClass: results.BodyClass || '',
      engine: results.EngineModel || results.EngineCylinders
        ? `${results.EngineCylinders || ''} cyl ${results.EngineModel || ''}`.trim()
        : '',
      manufacturer: results.Manufacturer || '',
      plant: results.PlantCity ? `${results.PlantCity}, ${results.PlantCountry || ''}` : '',
    };

    return NextResponse.json({ decoded });
  } catch (error) {
    console.error('VIN decode error:', error);
    return NextResponse.json(
      { error: 'Failed to decode VIN' },
      { status: 500 }
    );
  }
}
