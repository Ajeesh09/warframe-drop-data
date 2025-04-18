import { hash, parseRotation, parseChance } from './utils.js';

export default ($, id) => {
  const table = $(`#${id}`).next('table');
  const tbody = table.children()['0'];

  let rotation;
  const bountyRewards = [];
  let bountyReward;
  let stageText;
  let completion;

  if (!tbody) {
    console.error(`no table for ${id}`);
    return;
  }

  for (const tr of tbody.children) {
    const elem = tr.children[0];
    let text = $(elem).text();

    if (elem.name === 'th') {
      const tmp = parseRotation(text);
      // Reset rotation when encountering a new table header.
      rotation = undefined;
      completion = undefined;

      if (tmp) {
        rotation = tmp;
      } else if (text.includes('Completion')) {
        completion = text;
      } else {
        if (bountyReward) {
          bountyRewards.push(bountyReward);
        }

        bountyReward = {
          _id: hash(text),
          bountyLevel: text,
          rewards: { A: [], B: [], C: [] },
        };
      }
    } else if (elem.name === 'td' && elem.attribs.class !== 'blank-row') {
      if (tr.children.length === 2) {
        const stage = tr.children[1];
        stageText = $(stage).text();
      }

      if (tr.children.length === 3) {
        const chanceElem = tr.children[2];
        const chance = parseChance($(chanceElem).text());
        text = $(tr.children[1]).text();

        // If at this point rotation is still undefined we default to rotation 'C'.
        if (!rotation) {
          rotation = 'C';
        }

        bountyReward?.rewards[rotation].push({
          _id: hash(text),
          itemName: text,
          rarity: chance.rarity,
          chance: Number(chance.chance),
          stage: completion ?? stageText,
        });
      }
    }
  }

  // Push the remaining item
  bountyRewards.push(bountyReward);

  return bountyRewards;
};
