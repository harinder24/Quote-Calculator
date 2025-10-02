"use client";
import { MaxRectsPacker } from "maxrects-packer";
import {  useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([{ width: 0, height: 0, qty: 1, result: 0 }]);
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
  const [loading, setLoading] = useState(false);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const captureAndAnalyze = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    setLoading(true);

    try {
      const base64Image = await toBase64(file);
       

      
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyA6QcZP8TX4aHerdVMqd0eZLP5kpOCXzjg`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Image },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
console.log(data);

      const objects =
        data.responses[0]?.fullTextAnnotation?.text.split("\n")
        console.log(objects);
        
        let dimentions = {width : 0, height : 0}
        const dimentionsArray = []
        for (let i = 0; i < objects.length; i++) {
          if(!isNaN(Number(objects[i]))){
            if(dimentions.width === 0){
              dimentions.width = parseFloat(objects[i])
            }else{
              dimentions.height = parseFloat(objects[i])
             
                 dimentionsArray.push({ width: dimentions.width, height: dimentions.height, qty: 1, result: 0 })
              
              dimentions = {width : 0, height : 0}
            }
          }
          
        }
       setData(prevArray => [...prevArray, ...dimentionsArray]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
   
      <div className="flex flex-row justify-center">
        <div className="max-w-[1400px] px-4 flex flex-col gap-4 items-center py-4">
          <div className="flex flex-row justify-between items-center w-full">
            <button onClick={() => {setData([{ width: 0, height: 0, qty: 1,result: 0 }]); setFabric(0); setPrice(0);}} className=" bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-md cursor-pointer">
            Refresh
          </button>
          
            <input
        type="file"
        accept="image/*"
        capture="environment" // opens rear camera on phone
        onChange={captureAndAnalyze}
        className="hidden"
        id="cameraInput"
      />
      <label
        htmlFor="cameraInput"
        className="px-4 py-3 bg-blue-500 text-white rounded-md cursor-pointer"
      >
        {loading ? "Analyzing..." : "Take Picture"}
      </label>
          </div>
          
          {data.map((item, index) => {
            return (
              <IndividualInput
                key={index}
                width={item.width}
                height={item.height}
                result={item.result}
                qty={item.qty}
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
                  { width: 0, height: 0, qty: 1, result: 0 },
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
          <RollLayoutPage data={data} />
        </div>
      </div>
    </>
  );
}

function IndividualInput({ width, height, result, index, setData ,qty}) {
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
    
    const r = w * h * qty;
    setData((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], ...{ width, height, qty, result: r } };
      return updated;
    });
  }, [width, height,qty]);
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
    <div className="flex flex-row gap-4  h-12 max-[800px]:w-full">
      <button
        onClick={() => handleDeleteChange()}
        className=" bg-red-600 hover:bg-red-700 text-white px-6 rounded-md cursor-pointer"
      >
        -
      </button>
      <input
        className="h-full border-[1px] px-2 rounded-md max-[800px]:w-[100px]"
        type="number"
        value={width > 0 ? width : ""}
        onChange={(e) => {
          handleWidthChange(e);
        }}
        placeholder="Width"
      />

      <input
        className="h-full border-[1px] px-2 rounded-md max-[800px]:w-[100px]"
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
      <input
        className="h-full border-[1px] px-2 rounded-md max-[800px]:w-[100px]"
        value={qty}
        type="number"
        onChange={(e) => {
          const newQty = Number(e.target.value);
          setData((prevItems) => {
            const updated = [...prevItems];
            updated[index] = { ...updated[index], qty: newQty };
            return updated;
          });
        }}
        placeholder="Quantity"
      />
      <div className="flex-1 min-[600px]:hidden"></div>
      <div className="h-full flex flx-row justify-center items-center">
        <p>{result}</p>
      </div>
    </div>
  );
}




function RollLayoutPage({data}) {
  const [pieces, setPieces] = useState([]);

  const options = [{name:"Roller", inches: 4}, {name:"Zebra", inches: 6}];
  const [placed, setPlaced] = useState([]);
  const [efficiency, setEfficiency] = useState(0);
 const [selected, setSelected] = useState(options[0]);
useEffect(() => {
  const formattedPieces = data
    .filter((item) => item.width > 0 && item.height > 0 && item.qty > 0)
    .map((item) => ({
      width: parseFloat(item.width),
      height: parseFloat(item.height),
      qty: parseInt(item.qty),
    }));
  setPieces(formattedPieces);
}, [data]);

const [ROLL_WIDTH, setROLL_WIDTH] = useState(0);   
const [ROLL_HEIGHT, setROLL_HEIGHT] = useState(0);
const [ROLL_w, setROLL_w] = useState(3.2);   
const [ROLL_h, setROLL_h] = useState(30);
useEffect(()=>{
  setROLL_HEIGHT(ROLL_h * 39.3700787);
  setROLL_WIDTH(ROLL_w * 39.3700787);
},[ROLL_w,ROLL_h])  

  // 🔹 Run packing whenever pieces change
  useEffect(() => {
    if (pieces.length === 0) {
      setPlaced([]);
      setEfficiency(0);
      return;
    }

    const packer = new MaxRectsPacker(
  ROLL_WIDTH, 
  ROLL_HEIGHT, 
  0, 
  { smart: true, pot: false, allowRotation: true, heuristic: 'BestLongSideFit' }
);

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
      <div className="flex gap-3 mb-6 h-12">
        <input
          type="number"
          placeholder="Roll Width (m)"
          value={ROLL_w}
          onChange={(e) => setROLL_w(  e.target.value)}
          className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[175px] "
        />
        <input
          type="number"
          placeholder="Roll Height (m)"
          value={ROLL_h}
          onChange={(e) => setROLL_h(e.target.value)}
          className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[175px]  "
        />
       <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="h-full border-[1px] px-2 rounded-md max-[600px]:w-[175px]"
      >
        
        {options.map((item, index) => (
          
          <option key={index} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      
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
            <div className="flex flex-col items-center">
              <div className='font-semibold text-xl text-red-500 '>{i+1}</div>
            {p.width}×{p.height}
            
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4">
        Efficiency: <b>{efficiency}%</b>
      </p>
    </div>
  );
}

