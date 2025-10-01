"use client";
import { MaxRectsPacker } from "maxrects-packer";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([{ width: 0, height: 0, result: 0 }]);
  const [result, setResult] = useState(0);
  const [fabric, setFabric] = useState(0);
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    const total = data.reduce((sum, item) => sum + item.result, 0);
    setResult(total);
    setPrice(fabric * total);
  }, [data,fabric]);

  const handleChange = (e) => {
    setFabric(e.target.value);
  };

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="max-w-[1400px] px-4 flex flex-col gap-4 items-center py-4">
          <button onClick={() => {setData([{ width: 0, height: 0, result: 0 }]); setFabric(0); setPrice(0);}} className=" bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-md cursor-pointer">
            Refresh
          </button>
          {data.map((item, index) => {
            return (
              <IndividualInput
                key={index}
                width={item.width}
                height={item.height}
                result={item.result}
                index={index}
                setData={setData}
              />
            );
          })}

          <div className="w-full flex flex-row justify-between h-12">
            <button
              onClick={() =>
                setData((prevItems) => [
                  ...prevItems,
                  { width: 0, height: 0, result: 0 },
                ])
              }
              className=" bg-blue-600 hover:bg-blue-700 text-white px-[22px] rounded-md cursor-pointer"
            >
              +
            </button>
            <div className=" h-full flex flx-row justify-center items-center">
              <p>Total = {result}</p>
            </div>
          </div>
          <div className="w-full flex flex-row justify-between h-12">
            <input
              className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[175px]"
              value={fabric > 0 ? fabric : ""}
              onChange={handleChange}
              type="number"
              placeholder="Fabric multiplier"
            />
            <div className=" h-full flex flx-row justify-center items-center">
              <p>Price = CAD${price}</p>
            </div>
          </div>
          <RollLayoutPage />
        </div>
      </div>
    </>
  );
}

function IndividualInput({ width, height, result, index, setData }) {
  useEffect(() => {
    if (height == 0 || width == 0) {
      if (result != 0) {
        setData((prevItems) => {
          const updated = [...prevItems];
          updated[index] = {
            ...updated[index],
            ...{ width, height, result: 0 },
          };
          return updated;
        });
      }
      return;
    }
    let w = width;
    let h = height;

   
    w = w / 12;
    h = h / 12;
    if (w < 3) {
      w = 3;
    }
    if (h < 3) {
      h = 3;
    }
    w = Math.round(w);
    h = Math.round(h);
    const r = w * h;
    setData((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], ...{ width, height, result: r } };
      return updated;
    });
  }, [width, height]);
  const handleWidthChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setData((prevItems) => {
        const updated = [...prevItems];
        updated[index] = { ...updated[index], width: value };
        return updated;
      });
    }
  };
  const handleDeleteChange = () => {
    setData((prevItems) => prevItems.filter((item, i) => i !== index));
  };
  return (
    <div className="flex flex-row gap-4  h-12 max-[600px]:w-full">
      <button
        onClick={() => handleDeleteChange()}
        className=" bg-red-600 hover:bg-red-700 text-white px-6 rounded-md cursor-pointer"
      >
        -
      </button>
      <input
        className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[100px]"
        type="number"
        value={width > 0 ? width : ""}
        onChange={(e) => {
          handleWidthChange(e);
        }}
        placeholder="Width"
      />

      <input
        className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[100px]"
        value={height > 0 ? height : ""}
        type="number"
        onChange={(e) => {
          const newHeight = Number(e.target.value);
          setData((prevItems) => {
            const updated = [...prevItems];
            updated[index] = { ...updated[index], height: newHeight };
            return updated;
          });
        }}
        placeholder="Height"
      />
      <div className="flex-1 min-[600px]:hidden"></div>
      <div className="h-full flex flx-row justify-center items-center">
        <p>{result}</p>
      </div>
    </div>
  );
}




function RollLayoutPage() {
  const [pieces, setPieces] = useState([]);
  const [input, setInput] = useState({ width: "", height: "", qty: "1" });
  const [placed, setPlaced] = useState([]);
  const [efficiency, setEfficiency] = useState(0);

const ROLL_WIDTH = 120;   // inches
const ROLL_HEIGHT = 1800; // inches
  const addPiece = () => {
    if (!input.width || !input.height) return;
    setPieces((prev) => [
      ...prev,
      {
        width: parseFloat(input.width),
        height: parseFloat(input.height),
        qty: parseInt(input.qty),
      },
    ]);
    setInput({ width: "", height: "", qty: "1" });
  };

  // 🔹 Run packing whenever pieces change
  useEffect(() => {
    if (pieces.length === 0) {
      setPlaced([]);
      setEfficiency(0);
      return;
    }

    const packer = new MaxRectsPacker(ROLL_WIDTH, ROLL_HEIGHT, 0);

    pieces.forEach((p) => {
      for (let i = 0; i < p.qty; i++) {
        packer.add(p.width, p.height, { id: `${p.width}x${p.height}-${i}` });
      }
    });

    const rects = packer.bins[0]?.rects || [];
    setPlaced(rects);

    const usedArea = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    const totalArea = ROLL_WIDTH * ROLL_HEIGHT;
    setEfficiency(((usedArea / totalArea) * 100).toFixed(1));
  }, [pieces]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Roll Cutting Optimizer (Smart Packing)</h1>

      {/* Input form */}
      <div className="flex gap-3 mb-6">
        <input
          type="number"
          placeholder="Width (in)"
          value={input.width}
          onChange={(e) => setInput({ ...input, width: e.target.value })}
          className="border p-2 rounded w-28"
        />
        <input
          type="number"
          placeholder="Height (in)"
          value={input.height}
          onChange={(e) => setInput({ ...input, height: e.target.value })}
          className="border p-2 rounded w-28"
        />
        <input
          type="number"
          placeholder="Qty"
          value={input.qty}
          onChange={(e) => setInput({ ...input, qty: e.target.value })}
          className="border p-2 rounded w-20"
        />
        <button
          onClick={addPiece}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Visualization */}
      <div
        className="relative border border-gray-400 bg-gray-100"
        style={{
          width: "600px",
          height: `${(ROLL_HEIGHT / ROLL_WIDTH) * 600}px`,
        }}
      >
        {placed.map((p, i) => (
          <div
            key={i}
            className="absolute border border-black bg-green-400 flex items-center justify-center text-xs"
            style={{
              left: `${(p.x / ROLL_WIDTH) * 600}px`,
              top: `${(p.y / ROLL_WIDTH) * 600}px`,
              width: `${(p.width / ROLL_WIDTH) * 600}px`,
              height: `${(p.height / ROLL_WIDTH) * 600}px`,
            }}
          >
            {p.width}×{p.height}
          </div>
        ))}
      </div>

      <p className="mt-4">
        Efficiency: <b>{efficiency}%</b>
      </p>
    </div>
  );
}

