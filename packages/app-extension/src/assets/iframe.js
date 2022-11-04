async function fn() {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      video: true,
    });
    /* use the stream */
  } catch (err) {
    console.log(err);
    /* handle the error */
  }
}
fn();
