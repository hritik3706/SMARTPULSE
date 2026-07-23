import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

import Dashboard from "./components/Dashboard";
import Performance from "./components/Performance";
import Processes from "./components/Processes";
import AI from "./components/AI";

const API = "http://127.0.0.1:5000";

export default function App() {

  const [metrics, setMetrics] = useState(null);

  const [ai, setAI] = useState(null);

  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState({

    cpu: [],

    ram: [],

    gpu: [],

    disk: []

  });

  async function loadHealth() {

    try {

      const res = await axios.get(`${API}/api/health`);

      const live = res.data.metrics;

      setMetrics(live);

      setAI(res.data.ai);

      setHistory(prev => ({

        cpu: [

          ...prev.cpu,

          {

            time: new Date().toLocaleTimeString(),

            value: live.cpu

          }

        ].slice(-60),

        ram: [

          ...prev.ram,

          {

            time: new Date().toLocaleTimeString(),

            value: live.ram

          }

        ].slice(-60),

        gpu: [

          ...prev.gpu,

          {

            time: new Date().toLocaleTimeString(),

            value: live.gpu

          }

        ].slice(-60),

        disk: [

          ...prev.disk,

          {

            time: new Date().toLocaleTimeString(),

            value: live.disk

          }

        ].slice(-60)

      }));

      setLoading(false);

    }

    catch(err){

      console.log(err);

      toast.error("Backend Offline");

    }

  }

  useEffect(()=>{

      loadHealth();

      const timer=setInterval(loadHealth,1000);

      return ()=>clearInterval(timer);

  },[]);  async function optimizePC() {

    try {

      const res = await axios.post(`${API}/api/optimize`);

      toast.success(
        res.data.message ||
        "Optimization Complete"
      );

      loadHealth();

    }

    catch {

      toast.error(
        "Optimization Failed"
      );

    }

  }

  async function exportReport() {

    try {

      const res =
        await axios.post(
          `${API}/api/report`
        );

      console.log(res.data);

      toast.success(
        "AI Report Generated"
      );

    }

    catch {

      toast.error(
        "Report Generation Failed"
      );

    }

  }

  async function killProcess(pid){

    try{

      const res =
      await axios.post(

        `${API}/api/kill`,

        {

          pid

        }

      );

      toast.success(
        res.data.message
      );

      loadHealth();

    }

    catch{

      toast.error(
        "Cannot Kill Process"
      );

    }

  }

  async function getUpgradeAdvice(

      budget

  ){

      try{

          const res =
          await axios.post(

              `${API}/api/advise`,

              {

                  budget

              }

          );

          return res.data;

      }

      catch{

          toast.error(
              "Advisor Offline"
          );

          return null;

      }

  }

  if(

      loading ||

      !metrics ||

      !ai

  ){

      return(

          <>

              <Toaster
                  position="top-right"
              />

              <div

                  style={{

                      minHeight:"100vh",

                      display:"flex",

                      justifyContent:"center",

                      alignItems:"center",

                      color:"white",

                      fontSize:34,

                      fontWeight:800

                  }}

              >

                  SMARTPULSE Loading...

              </div>

          </>

      );

  }

  return(

      <>

          <Toaster
              position="top-right"
          />

          <main

              style={{

                  maxWidth:1800,

                  margin:"0 auto",

                  padding:30

              }}

          >

              <Dashboard

                  metrics={metrics}

                  ai={ai}

                  optimizePC={optimizePC}

                  exportReport={exportReport}

              />

              <Performance

                  metrics={metrics}

                  history={history}

              />

              <Processes

                  processes={metrics.processes}

                  killProcess={killProcess}

              />

              <AI

                  ai={ai}

                  metrics={metrics}

                  advisor={getUpgradeAdvice}

              />

          </main>

      </>

  );

}