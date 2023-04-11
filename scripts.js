import { config } from "dotenv";
config();

import { db } from "./firebase.js";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { series } from "./series-list.js";

const oneCollection = collection(db, "series");

async function readData() {
  const data = await getDocs(oneCollection);
  //   data.forEach((doc) => {
  //     // doc.data() is never undefined for query doc snapshots
  //     console.log(doc.id, " => ", doc.data());
  //   });
  //   const structed = data?.docs?.map((d) => ({ ...d?.data(), id: d?.id }));
  const availabeOnStore = data?.docs?.map((d) => ({
    id: d?.id,
    status: d?.data().status,
  }));
  let allItemsId = availabeOnStore.map((e) => e.id);
  let filtered = series.filter((e) => !allItemsId.includes(e));
  //   let newSeriesSet = series.filter((ser) => !availabeOnStore.id.includes(ser));
  let stillRunning = availabeOnStore
    .filter((ser) => ser.status === "Running")
    .map((e) => e.id);

  return [...filtered, ...stillRunning];
}

async function createData(newSeriesDataList) {
  return Promise.all(
    newSeriesDataList.map(async (e) => {
      const reference = doc(db, "series", `${e?.permalink}`);
      await setDoc(reference, { ...e }, { merge: true });
    })
  );
}

async function fetchData(newSeriesList = []) {
  return Promise.all(
    newSeriesList.map(async (e) => {
      let correctedUrl = `${process.env.API + e}`;
      let seriesData = await fetch(correctedUrl)
        .then((e) => e.json())
        .catch((e) => console.warn(e));
      return seriesData?.tvShow;
    })
  );
}

async function initApp() {
  let newSeriesList = await readData();
  let seriesDetails = await fetchData(newSeriesList);
  await createData(seriesDetails);

  return process.exit();
}

initApp();
