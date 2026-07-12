'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  pubDate: string;
  durationSeconds: number;
  podcastTitle: string;
  sourceUrl: string;
}

const SPEEDS = ['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];

export default function PodcastsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentEpisode = episodes[currentIndex];

  useEffect(() => {
    fetch('/api/podcasts')
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.episodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnd = () => {
      setIsPlaying(false);
      if (currentIndex < episodes.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentIndex, episodes.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(SPEEDS[speedIdx]);
    }
  }, [speedIdx]);

  const playEpisode = useCallback((index: number) => {
    if (index === currentIndex && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentIndex(index);
    setProgress(0);
    setCurrentTime(0);
    const ep = episodes[index];
    if (ep?.audioUrl) {
      const audio = new Audio(ep.audioUrl);
      audio.playbackRate = parseFloat(SPEEDS[speedIdx]);
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentIndex, isPlaying, episodes, speedIdx]);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !audioRef.current) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const dur = audioRef.current.duration || 0;
    audioRef.current.currentTime = pct * dur;
  };

  const skip = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + sec, audioRef.current.duration || 0));
    }
  };

  const prevTrack = () => {
    if (currentIndex > 0) playEpisode(currentIndex - 1);
  };

  const nextTrack = () => {
    if (currentIndex < episodes.length - 1) playEpisode(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Listen</h1>
          <p className={styles.pageSubtitle}>Podcasts from open-source creators, updated daily.</p>
        </header>
        <div className={styles.skeletonCard} style={{ height: 260, marginBottom: 32 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonCard} style={{ height: 76, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Listen</h1>
          <p className={styles.pageSubtitle}>Podcasts from open-source creators, updated daily.</p>
        </header>
        <div className={styles.emptyState}>
          <p>No episodes available. Check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Listen</h1>
        <p className={styles.pageSubtitle}>Podcasts from open-source creators, updated daily.</p>
      </header>

      {/* Now Playing */}
      <div className={styles.nowPlaying}>
        <div className={styles.npCover}>
          <img
            src={currentEpisode.coverImageUrl || '/images/podcast-placeholder.jpg'}
            alt={currentEpisode.podcastTitle}
          />
          {isPlaying && (
            <div className={styles.npCoverOverlay}>
              <div className={styles.npWave}>
                <div className={styles.npWaveBar} />
                <div className={styles.npWaveBar} />
                <div className={styles.npWaveBar} />
                <div className={styles.npWaveBar} />
                <div className={styles.npWaveBar} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.npInfo}>
          <span className={styles.npLabel}>Now Playing</span>
          <h2 className={styles.npTitle}>{currentEpisode.title}</h2>
          <p className={styles.npAuthor}>{currentEpisode.podcastTitle}</p>

          <div className={styles.playerProgress}>
            <div className={styles.progressBarWrap} ref={progressRef} onClick={seekTo}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
              <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
            </div>
            <div className={styles.progressTimes}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentEpisode.durationSeconds)}</span>
            </div>
          </div>

          <div className={styles.playerControls}>
            <button className={styles.ctrlBtn} title="Previous" onClick={prevTrack} disabled={currentIndex === 0}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>
            <button className={styles.ctrlBtn} title="Rewind 15s" onClick={() => skip(-15)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
              </svg>
            </button>
            <button className={`${styles.ctrlBtn} ${styles.ctrlBtnPlay}`} title={isPlaying ? 'Pause' : 'Play'} onClick={() => playEpisode(currentIndex)}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button className={styles.ctrlBtn} title="Forward 15s" onClick={() => skip(15)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
              </svg>
            </button>
            <button className={styles.ctrlBtn} title="Next" onClick={nextTrack} disabled={currentIndex >= episodes.length - 1}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
            <button className={styles.speedBtn} onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}>
              {SPEEDS[speedIdx]}
            </button>
            <div className={styles.volumeWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <div className={styles.volumeBar}><div className={styles.volumeFill} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className={styles.playlistSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Up Next</h2>
        </div>
        <div className={styles.playlist}>
          {episodes.map((ep, i) => (
            <div
              key={ep.id}
              className={`${styles.playlistItem} ${i === currentIndex ? styles.playlistItemActive : ''}`}
              onClick={() => playEpisode(i)}
            >
              <span className={styles.plNum}>{i + 1}</span>
              <img
                className={styles.plCover}
                src={ep.coverImageUrl || '/images/podcast-placeholder.jpg'}
                alt={ep.podcastTitle}
              />
              <div className={styles.plInfo}>
                <div className={styles.plTitle}>{ep.title}</div>
                <div className={styles.plAuthor}>{ep.podcastTitle}</div>
              </div>
              <span className={styles.plDuration}>{formatTime(ep.durationSeconds)}</span>
              <button
                className={styles.plPlay}
                onClick={(e) => { e.stopPropagation(); playEpisode(i); }}
              >
                {i === currentIndex && isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
