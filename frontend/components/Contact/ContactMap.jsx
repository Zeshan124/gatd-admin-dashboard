export default function ContactMap({
  src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7992!2d103.8607!3d1.3006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da19a47be2f459%3A0x8376c5b8cb79b58c!2sSultan%20Plaza%2C%20100%20Jalan%20Sultan%2C%20Singapore%20199001!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg",
  height = "480",
  title = "GATD Office Location",
}) {
  return (
    <section className="bg-white">
      <div className="w-full" style={{ height: `${height}px` }}>
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0, filter: "grayscale(100%)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
    </section>
  );
}
