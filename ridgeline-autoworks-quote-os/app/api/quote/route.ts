import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, isStaff, vehicleInput } = await req.json();
    const lower = (message || '').toLowerCase();
    let laborHours = 2.0;
    let parts = [];

    if (lower.includes('brake') || lower.includes('rotor') || lower.includes('grind') || lower.includes('squeak')) {
      laborHours = 2.5;
      parts = [
        { name: 'Ceramic Brake Pad Set (Front)', partNumber: 'PAD-BRK-904', wholesaleCost: 45.0, retailPrice: 85.0 },
        { name: 'Vented Brake Rotors (Pair)', partNumber: 'RTR-VENT-441', wholesaleCost: 95.0, retailPrice: 165.0 }
      ];
    } else if (lower.includes('battery')) {
      laborHours = 0.8;
      parts = [
        { name: 'AGM 850CCA Heavy Duty Battery', partNumber: 'BAT-AGM-850', wholesaleCost: 110.0, retailPrice: 195.0 }
      ];
    } else if (lower.includes('oil') || lower.includes('service')) {
      laborHours = 0.6;
      parts = [
        { name: 'Full Synthetic 5W-30 (6 Qts)', partNumber: 'OIL-SYN-5W30', wholesaleCost: 28.0, retailPrice: 58.0 },
        { name: 'High Flow Oil Filter', partNumber: 'FLT-OIL-091', wholesaleCost: 8.0, retailPrice: 18.0 }
      ];
    } else {
      laborHours = 1.5;
      parts = [
        { name: 'OEM Replacement Hardware Assembly', partNumber: 'GEN-OE-112', wholesaleCost: 65.0, retailPrice: 120.0 }
      ];
    }

    const laborRate = 140.0;
    const partsSubtotal = parts.reduce((acc, p) => acc + p.retailPrice, 0);
    const partsWholesaleSubtotal = parts.reduce((acc, p) => acc + p.wholesaleCost, 0);
    const laborSubtotal = laborHours * laborRate;
    const shopSupplies = Math.min(45.0, parseFloat((laborSubtotal * 0.08).toFixed(2)));
    const tax = parseFloat(((partsSubtotal + laborSubtotal + shopSupplies) * 0.0825).toFixed(2));
    const totalCustomerPrice = parseFloat((partsSubtotal + laborSubtotal + shopSupplies + tax).toFixed(2));

    const technicianDirectCost = laborHours * 45.0;
    const internalNetCost = parseFloat((partsWholesaleSubtotal + technicianDirectCost + (shopSupplies * 0.4)).toFixed(2));
    const grossProfit = totalCustomerPrice - tax - internalNetCost;
    const internalProfitMargin = parseFloat(((grossProfit / (totalCustomerPrice - tax)) * 100).toFixed(1));

    return NextResponse.json({
      vehicle: vehicleInput || '2017 Volkswagen Passat TSI R-Line',
      symptoms: message,
      isStaff,
      laborHours,
      laborRate,
      parts,
      partsSubtotal,
      laborSubtotal,
      shopSupplies,
      tax,
      totalCustomerPrice,
      ...(isStaff && { internalNetCost, internalProfitMargin }),
      breakdownSummary: `Diagnosed: ${message}. Sourced OE-grade components matching chassis spec.`
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to compute dynamic quote' }, { status: 500 });
  }
}
