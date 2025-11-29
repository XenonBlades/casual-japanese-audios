const audioFolder = 'audio/';
const audioPlayers = [];

// Generate a large collection of sample filenames (chapters 1-4, tracks 1-44).
// Replace or extend this list if you add more files to the audio/ directory.
const audioFiles = [
  "1-01.mp3","1-02.mp3","1-03.mp3","1-04.mp3","1-05.mp3","1-06.mp3","1-07.mp3","1-08.mp3","1-09.mp3","1-10.mp3",
  "2-01.mp3","2-02.mp3","2-03.mp3","2-04.mp3","2-05.mp3","2-06.mp3","2-07.mp3","2-08.mp3","2-09.mp3","2-10.mp3","2-11.mp3","2-12.mp3","2-13.mp3",
  "3-01.mp3","3-02.mp3","3-03.mp3","3-04.mp3","3-05.mp3","3-06.mp3","3-07.mp3","3-08.mp3","3-09.mp3","3-10.mp3","3-11.mp3","3-12.mp3","3-13.mp3","3-14.mp3","3-15.mp3","3-16.mp3","3-17.mp3","3-18.mp3","3-19.mp3","3-20.mp3","3-21.mp3","3-22.mp3","3-23.mp3","3-24.mp3","3-25.mp3",
  "4-01.mp3","4-02.mp3","4-03.mp3","4-04.mp3","4-05.mp3","4-06.mp3","4-07.mp3","4-08.mp3","4-09.mp3","4-10.mp3","4-11.mp3","4-12.mp3","4-13.mp3","4-14.mp3","4-15.mp3","4-16.mp3","4-17.mp3","4-18.mp3","4-19.mp3","4-20.mp3","4-21.mp3","4-22.mp3","4-23.mp3","4-24.mp3","4-25.mp3","4-26.mp3","4-27.mp3","4-28.mp3","4-29.mp3","4-30.mp3","4-31.mp3","4-32.mp3","4-33.mp3","4-34.mp3","4-35.mp3","4-36.mp3","4-37.mp3","4-38.mp3","4-39.mp3","4-40.mp3","4-41.mp3","4-42.mp3","4-43.mp3","4-44.mp3"
];

document.addEventListener('DOMContentLoaded', () => {
  const accordion = document.getElementById('accordion');
  const searchInput = document.getElementById('search');
  const emptyState = document.getElementById('emptyState');

  const grouped = groupByChapter(audioFiles);
  const sections = buildAccordion(accordion, grouped);
  setupSearch(searchInput, sections, emptyState);
});

function groupByChapter(files) {
  const chapters = new Map();
  const pattern = /^(\d+)-(\d+)\.mp3$/i;

  files.forEach((file) => {
    const match = file.match(pattern);
    if (!match) return;

    const chapterNumber = Number(match[1]);
    const trackNumber = Number(match[2]);
    const entry = { file, chapterNumber, trackNumber };

    if (!chapters.has(chapterNumber)) {
      chapters.set(chapterNumber, []);
    }

    chapters.get(chapterNumber).push(entry);
  });

  for (const [, tracks] of chapters) {
    tracks.sort((a, b) => a.trackNumber - b.trackNumber);
  }

  return new Map([...chapters.entries()].sort((a, b) => a[0] - b[0]));
}

function buildAccordion(accordionEl, grouped) {
  const sections = [];

  grouped.forEach((tracks, chapterNumber) => {
    const section = createSection(chapterNumber, tracks);
    accordionEl.appendChild(section.item);
    sections.push(section);
  });

  return sections;
}

function createSection(chapterNumber, tracks) {
  const item = document.createElement('section');
  item.className = 'accordion-item';

  const trigger = document.createElement('button');
  trigger.className = 'accordion-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');

  const label = document.createElement('div');
  label.className = 'trigger-label';

  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '›';

  const title = document.createElement('span');
  title.textContent = `Chapter ${chapterNumber}`;

  label.appendChild(arrow);
  label.appendChild(title);

  const count = document.createElement('span');
  count.className = 'count';
  count.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`;

  trigger.appendChild(label);
  trigger.appendChild(count);

  const panel = document.createElement('div');
  panel.className = 'accordion-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', `Chapter ${chapterNumber}`);

  const list = document.createElement('ul');
  list.className = 'track-list';

  tracks.forEach((track) => {
    const itemEl = document.createElement('li');
    itemEl.className = 'track';
    itemEl.dataset.search = `${track.chapterNumber}-${String(track.trackNumber).padStart(2, '0')}`;

    const name = document.createElement('div');
    name.className = 'track-name';
    name.textContent = `Track ${String(track.trackNumber).padStart(2, '0')}`;

    const meta = document.createElement('small');
    meta.textContent = `${track.chapterNumber}-${String(track.trackNumber).padStart(2, '0')}.mp3`;

    name.appendChild(meta);

    const { container, audio } = createCustomPlayer(track.file);
    audioPlayers.push(audio);

    itemEl.appendChild(name);
    itemEl.appendChild(container);
    list.appendChild(itemEl);
  });

  panel.appendChild(list);

  trigger.addEventListener('click', () => toggleSection(item, panel, trigger));

  item.appendChild(trigger);
  item.appendChild(panel);

  return { item, panel, trigger };
}

function createCustomPlayer(file) {
  const container = document.createElement('div');
  container.className = 'player-shell';

  const audio = document.createElement('audio');
  audio.className = 'audio-player';
  audio.preload = 'metadata';
  audio.src = `${audioFolder}${file}`;
  audio.controls = false;
  audio.setAttribute('tabindex', '-1');

  const controls = document.createElement('div');
  controls.className = 'player-controls';

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'play-toggle';
  playButton.setAttribute('aria-label', 'Play');
  playButton.textContent = '►';

  const time = document.createElement('span');
  time.className = 'timecode';
  time.textContent = '0:00 / 0:00';

  const progress = document.createElement('input');
  progress.type = 'range';
  progress.min = '0';
  progress.step = '0.1';
  progress.value = '0';
  progress.className = 'player-progress';
  progress.setAttribute('aria-label', 'Seek');

  controls.appendChild(playButton);
  controls.appendChild(progress);
  controls.appendChild(time);

  container.appendChild(controls);
  container.appendChild(audio);

  playButton.addEventListener('click', () => togglePlayback(audio, playButton));

  audio.addEventListener('loadedmetadata', () => {
    progress.max = audio.duration.toString();
    updateTimecode(time, audio.currentTime, audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    progress.value = audio.currentTime;
    updateTimecode(time, audio.currentTime, audio.duration);
  });

  audio.addEventListener('play', () => {
    playButton.textContent = '❚❚';
    playButton.setAttribute('aria-label', 'Pause');
    pauseOtherAudios(audio);
  });

  audio.addEventListener('pause', () => {
    playButton.textContent = '►';
    playButton.setAttribute('aria-label', 'Play');
  });

  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    progress.value = '0';
    updateTimecode(time, 0, audio.duration);
    playButton.textContent = '►';
    playButton.setAttribute('aria-label', 'Play');
  });

  progress.addEventListener('input', () => {
    audio.currentTime = Number(progress.value);
  });

  return { container, audio };
}

function togglePlayback(audio, button) {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
    button.textContent = '►';
    button.setAttribute('aria-label', 'Play');
  }
}

function pauseOtherAudios(current) {
  audioPlayers.forEach((player) => {
    if (player !== current && !player.paused) {
      player.pause();
    }
  });
}

function updateTimecode(el, current, duration) {
  const safeDuration = Number.isFinite(duration) ? duration : 0;
  el.textContent = `${formatTime(current)} / ${formatTime(safeDuration)}`;
}

function formatTime(time) {
  const totalSeconds = Math.floor(time || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function toggleSection(item, panel, trigger, forceOpen = undefined) {
  const isOpen = forceOpen !== undefined ? !forceOpen : item.classList.contains('open');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

  if (shouldOpen) {
    item.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  } else {
    item.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    panel.style.maxHeight = '0px';
  }
}

function setupSearch(input, sections, emptyState) {
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let totalMatches = 0;

    sections.forEach(({ item, panel, trigger }) => {
      const tracks = Array.from(panel.querySelectorAll('.track'));
      let sectionMatches = 0;

      tracks.forEach((trackEl) => {
        const match = trackEl.dataset.search.toLowerCase().includes(term);
        trackEl.style.display = match ? 'grid' : 'none';
        if (match) sectionMatches += 1;
      });

      if (sectionMatches > 0) {
        totalMatches += sectionMatches;
        item.style.display = '';
        toggleSection(item, panel, trigger, true);
      } else {
        item.style.display = 'none';
        toggleSection(item, panel, trigger, false);
      }
    });

    emptyState.hidden = totalMatches > 0;

    if (!term) {
      emptyState.hidden = true;
      sections.forEach(({ item, panel, trigger }) => {
        item.style.display = '';
        toggleSection(item, panel, trigger, false);
      });
    }
  });
}
