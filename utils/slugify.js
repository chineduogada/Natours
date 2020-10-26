const slugify = (text) => {
	const slug = text
		.trim()
		.toLowerCase()
		.replace(/[^\w\s\t]+/g, "")
		.trim()
		.replace(/\s/g, "-")
		.replace(/-{2,}/g, "-");

	return slug;
};

module.exports = slugify;

