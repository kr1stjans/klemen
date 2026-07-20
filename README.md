# Remembering Klemen — V spomin Klemnu

Made with love, in memory of a good friend.

## His videos

The **Posnetki / Videos** section lists all 26 videos from Klemen's channel
(`@jarheadSLO`), about 3 h 07 m of flying. Each tile is a local thumbnail plus a
play button; the video itself is only fetched once a visitor clicks.

**The videos are self-hosted, not embedded from YouTube.** His channel has
embedding disabled (the YouTube IFrame API refuses them with error 150 — *"the
owner does not allow this video to be played in embedded players"*, confirmed
against a control video that embedded fine). Rather than depend on a setting we
do not control, the videos are archived on our own Cloudflare R2 storage and
played from there with a plain `<video>` element:

```
https://s3.edpid.com/remembering-klemen/video/<nn>-<slug>.mp4
```

1080p H.264 with `+faststart`, so playback starts while the rest streams, and R2
serves range requests so seeking works. The 4K VP9 masters were downscaled to
1080p; the files that were already 1080p H.264 were remuxed without re-encoding
and keep their original quality.

There is no YouTube script, no iframe and no embedding permission involved. Each
tile keeps its YouTube id only as a link target, which is also the fallback shown
if a file ever fails to load.

### Adding or replacing a video

Upload the MP4 to R2 with the shared helper (single file at a time, never a
recursive copy), then point the tile's `data-src` at the returned URL:

```bash
/scripts/r2-upload.sh /path/to/video.mp4 remembering-klemen/video/27-slug.mp4 edpid-media
```

## Hero video

The hero plays a silent 19-second loop from Klemen's own footage — the video his
skydiving friends named him after, *Mr. Smiley*. Like the rest of the videos it
streams from R2:

```
https://s3.edpid.com/remembering-klemen/video/hero-klemen.mp4
```

It is muted, loops, and plays inline. It pauses when the tab is hidden or the
hero scrolls out of view, and does not autoplay at all for visitors who prefer
reduced motion. The poster frame (`assets/img/hero-poster.webp`) is kept **local
on purpose**: it is the first thing anyone sees, so it paints immediately without
waiting on a second origin, while the video streams in behind it. The page sends
`preconnect` to `s3.edpid.com` so that connection is warm before playback starts.
If the video never loads, the poster stays and the hero still looks right.

The full-length original is archived, uncut, at:

```
https://s3.edpid.com/remembering-klemen/originals/mr-smiley.mp4   (579 MB, 8m11s, 1080p HEVC)
```

The 19-second loop was cut from it (from 04:52, the hand-in-hand sequence) with:

```bash
ffmpeg -ss 292 -t 19 -i mr-smiley.mp4 -an \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" \
  -c:v libx264 -profile:v high -crf 30 -preset slow -pix_fmt yuv420p \
  -movflags +faststart hero-klemen.mp4
```

## The friends' tribute

The section titled **»Mr. Smiley«** carries the text written by Klemen's
skydiving friends, in their own words. It is marked up as a `<blockquote>` and
signed underneath, so it always reads unmistakably as **their** words rather than
the site's. The Slovenian is their original; the English beside it is a
translation of it.

## Note on the R2 bucket

Everything under `remembering-klemen/` lives in the `edpid-media` bucket, which
has **object lock enabled — uploaded files cannot be deleted**. That is deliberate
for an archive of someone's memory: his videos cannot be lost to an accidental
delete. It also means keys are permanent, so think before uploading a new one.
