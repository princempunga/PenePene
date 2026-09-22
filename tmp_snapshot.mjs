export default async function run(page, ui) {
    const s = await ui.snapshot();
    return { snapshot: s };
}
