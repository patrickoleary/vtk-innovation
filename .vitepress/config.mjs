import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'VTK Innovation',
  description:
    'Accelerating Community-Driven Medical Innovation with VTK (NIH 2R01EB014955-09)',
  base: '/vtk-innovation/',
  ignoreDeadLinks: true,
  srcExclude: ['README.md'],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
    ],
    sidebar: [
      { text: 'Overview', link: '/' },
      {
        text: 'Aim 1 Topic Reports',
        items: [
          {
            text: 'VTK-WASM',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-1/vtk-wasm/blog' },
              { text: 'Executive summary', link: '/Aim-1/vtk-wasm/summary' },
              { text: 'Short report', link: '/Aim-1/vtk-wasm/short' },
              { text: 'Detailed report', link: '/Aim-1/vtk-wasm/detailed' },
            ],
          },
          {
            text: 'VTK WebGPU',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-1/vtk-webgpu/blog' },
              { text: 'Executive summary', link: '/Aim-1/vtk-webgpu/summary' },
              { text: 'Short report', link: '/Aim-1/vtk-webgpu/short' },
              { text: 'Detailed report', link: '/Aim-1/vtk-webgpu/detailed' },
            ],
          },
          {
            text: 'Fides and Conduit',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-1/fides/blog' },
              { text: 'Executive summary', link: '/Aim-1/fides/summary' },
              { text: 'Short report', link: '/Aim-1/fides/short' },
              { text: 'Detailed report', link: '/Aim-1/fides/detailed' },
            ],
          },
          {
            text: 'trame-vtklocal',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-1/trame-vtklocal/blog' },
              { text: 'Executive summary', link: '/Aim-1/trame-vtklocal/summary' },
              { text: 'Short report', link: '/Aim-1/trame-vtklocal/short' },
              { text: 'Detailed report', link: '/Aim-1/trame-vtklocal/detailed' },
            ],
          },
        ],
      },
      {
        text: 'Aim 2 Topic Reports',
        items: [
          {
            text: 'AI transfer functions',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-2/tf/blog' },
              { text: 'Executive summary', link: '/Aim-2/tf/summary' },
              { text: 'Short report', link: '/Aim-2/tf/short' },
              { text: 'Detailed report', link: '/Aim-2/tf/detailed' },
            ],
          },
          {
            text: 'AI-Data',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/Aim-2/data/blog' },
              { text: 'Executive summary', link: '/Aim-2/data/summary' },
              { text: 'Short report', link: '/Aim-2/data/short' },
              { text: 'Detailed report', link: '/Aim-2/data/detailed' },
            ],
          },
        ],
      },
      {
        text: 'Community Activities',
        items: [
          {
            text: 'Releases and community',
            collapsed: true,
            items: [
              { text: 'Blog', link: '/vtk2026/blog' },
              { text: 'Executive summary', link: '/vtk2026/summary' },
              { text: 'Short report', link: '/vtk2026/short' },
              { text: 'Detailed report', link: '/vtk2026/detailed' },
            ],
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/patrickoleary/vtk-innovation' },
    ],
    outline: { level: [2, 3] },
    search: { provider: 'local' },
  },
})
