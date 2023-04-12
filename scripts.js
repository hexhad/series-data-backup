import { config } from "dotenv";
config();

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { series } from "./series-list.js";

import { createSpinner } from "nanospinner";

const seriesCollection = collection(db, "series");

async function readData(preprocess = true) {
  const spinner = createSpinner("Reading from FIREBASE...").start();
  const data = await getDocs(seriesCollection);
  //   data.forEach((doc) => {
  //     // doc.data() is never undefined for query doc snapshots
  //     console.log(doc.id, " => ", doc.data());
  //   });
  //   const structed = data?.docs?.map((d) => ({ ...d?.data(), id: d?.id }));
  const availabeOnStore = data?.docs?.map((d) => ({
    id: d?.id,
    status: d?.data().status,
  }));
  if (preprocess) {
    let allItemsId = availabeOnStore.map((e) => e.id);
    let filtered = series.filter((e) => !allItemsId.includes(e));
    //   let newSeriesSet = series.filter((ser) => !availabeOnStore.id.includes(ser));
    let stillRunning = availabeOnStore
      .filter((ser) => ser.status === "Running")
      .map((e) => e.id);
    spinner.success({ text: "Finished 🎉" });
    return { filtered, stillRunning };
  } else {
    spinner.success({ text: "Available List ⚡" });
    console.table(availabeOnStore);
  }
}

async function createData(newSeriesDataList, seriesList) {
  const spinner = createSpinner("Updating on FIREBASE...").start();
  let promiseMap = newSeriesDataList?.map(async (e) => {
    const reference = doc(db, "series", `${e?.permalink}`);
    if (seriesList.stillRunning.includes(e?.permalink)) {
      await updateDoc(reference, { ...e });
    } else {
      await setDoc(reference, { ...e }, { merge: true });
    }
  });
  spinner.success({ text: "Updated  🎉" });
  return Promise.all(promiseMap);
}

async function fetchData(seriesList = []) {
  const spinner = createSpinner("Fetching Series Database...").start();
  let promiseMap = [...seriesList?.filtered, ...seriesList?.stillRunning].map(
    async (e) => {
      let correctedUrl = `${process.env.API + e}`;
      let seriesData = await fetch(correctedUrl)
        .then((e) => e.json())
        .catch((e) => console.warn(e));
      return seriesData?.tvShow;
    }
  );
  spinner.success({ text: "Fetched  🎉" });
  return Promise.all(promiseMap);
}

async function initApp() {
  let newSeriesList = await readData();
  let seriesDetails = await fetchData(newSeriesList);
  await createData(seriesDetails, newSeriesList);
  await readData(false);

  return process.exit(1);
}

initApp();
