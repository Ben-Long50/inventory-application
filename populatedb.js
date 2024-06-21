#! /usr/bin/env node

import mongoose from 'mongoose';
import fs from 'fs';

import Potion from './models/potion.js';
import Classification from './models/classification.js';
import Effect from './models/effect.js';

console.log(
  'This script populates some potions and classifications to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://Ben_Long:7skFOfMMxEQz6mwz@cluster0.xp4dg26.mongodb.net/apothecary?retryWrites=true&w=majority&appName=Cluster0"',
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const potions = [];
const classifications = [];
const effects = [];

mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');

  await mongoose.connect(mongoDB);

  console.log('Debug: Should be connected?');

  await createClassifications();
  await createEffects();
  await createPotions();

  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// potion[0] will always be the Fantasy potion, regardless of the order
// in which the elements of promise.all's argument complete.
async function potionCreate(
  index,
  name,
  classification,
  effect,
  subEffects,
  price,
  quantityInStock,
) {
  const imagePath = './public/major-health-potion.jpg';
  const imageBuffer = fs.readFileSync(imagePath);
  const potion = new Potion({
    name,
    classification,
    effect,
    subEffects,
    price,
    quantityInStock,
    image: imageBuffer,
  });
  await potion.save();
  potions[index] = potion;
  console.log(`Added potion`);
}

async function classificationCreate(index, title, multiplier, subMultiplier) {
  const classification = new Classification({
    title,
    multiplier,
    subMultiplier,
  });
  await classification.save();
  classifications[index] = classification;
  console.log(`Added classification: ${title}`);
}

async function effectCreate(index, title, statBonus, duration) {
  const effect = new Effect({
    title,
    statBonus,
    duration,
  });
  await effect.save();
  effects[index] = effect;
  console.log(`Added effect: ${title}`);
}

async function createClassifications() {
  console.log('Adding classifications');
  await Promise.all([
    classificationCreate(0, 'Epic', 10, 5),
    classificationCreate(1, 'Major', 5, 2.5),
    classificationCreate(2, 'Standard', 1, 0.5),
    classificationCreate(3, 'Minor', 0.5, 0.25),
    classificationCreate(4, 'Miniscule', 0.25, 0.125),
  ]);
}

async function createEffects() {
  console.log('Adding classifications');
  await Promise.all([
    effectCreate(0, 'Health', 25, null),
    effectCreate(1, 'Health Regeneration', 50, 20),
    effectCreate(2, 'Mana', 25, null),
    effectCreate(3, 'Mana Regeneration', 50, 20),
    effectCreate(4, 'Strength', 10, 60),
    effectCreate(5, 'Speed', 10, 60),
    effectCreate(6, 'Luck', 10, 60),
    effectCreate(7, 'Invisibility', null, 15),
  ]);
}

//  classification, effect, subEffects, price, quantitiyInStock

async function createPotions() {
  console.log('Adding potions');
  await Promise.all([
    potionCreate(
      0,
      'Temp Name',
      classifications[2],
      effects[0],
      [effects[4]],
      20,
      62,
    ),
    potionCreate(1, 'Temp Name', classifications[1], effects[5], [], 50, 14),
    potionCreate(
      2,
      'Temp Name',
      classifications[4],
      effects[7],
      [effects[3], effects[1]],
      3,
      8,
    ),
  ]);
}
