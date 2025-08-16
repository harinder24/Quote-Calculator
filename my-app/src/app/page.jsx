"use client";

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
          <p className="text-center">
            for feet use "." like 5.0 or 6.9, for inches use without "." like 67
          </p>
          <button className=" bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-md cursor-pointer">
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

    let w2 = w.toString().split(".");
    let h2 = h.toString().split(".");
    if (w2.length > 1) {
      const feet = Math.floor(w);
      const inches = Math.round((w - feet) * 12);
      w = feet * 12 + inches;
    }
    if (h2.length > 1) {
      const feet = Math.floor(h);
      const inches = Math.round((h - feet) * 12);
      h = feet * 12 + inches;
    }
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
