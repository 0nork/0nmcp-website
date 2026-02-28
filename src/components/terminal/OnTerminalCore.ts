import { WebContainer } from '@webcontainer/api'
import type { OnTerminalConfig, RuntimeType } from './OnTerminalTypes'
import { terminalBus } from './OnTerminalEventBus'
import { detectRuntime } from '@/lib/terminal/language-detect'

declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<any>
  }
}

export class OnTerminalCore {
  private webcontainer: WebContainer | null = null
  private pyodide: any = null
  private config: OnTerminalConfig
  private cwd = '/home/user'
  private nodeReady = false
  private pythonReady = false
  private writeCallback: ((text: string) => void) | null = null

  constructor(config: OnTerminalConfig) {
    this.config = {
      enableNode: true,
      enablePython: true,
      enablePreview: false,
      workDir: 'workspace',
      ...config,
    }
  }

  async boot(writeFn: (text: string) => void): Promise<void> {
    this.writeCallback = writeFn

    this.write('\x1b[38;2;0;255;102m')
    this.write('\r\n')
    this.write('  0n Web Terminal v1.0.0\r\n')
    this.write('  Browser-Native Dev Environment\r\n')
    this.write('  Node.js 18+ \u00b7 Python 3.12 \u00b7 Shell\r\n')
    this.write('\r\n')
    this.write('\x1b[0m')

    const boots: Promise<void>[] = []
    if (this.config.enableNode) boots.push(this.bootNode())
    if (this.config.enablePython) boots.push(this.bootPython())
    await Promise.allSettled(boots)

    this.write('\r\n\x1b[38;2;0;255;102m\u2713 Terminal ready\x1b[0m\r\n\r\n')
    terminalBus.emit('ready', { node: this.nodeReady, python: this.pythonReady })
  }

  private async bootNode(): Promise<void> {
    try {
      this.write('\x1b[38;2;58;66;96m\u21BB Booting Node.js runtime...\x1b[0m\r\n')
      this.webcontainer = await WebContainer.boot()
      await this.webcontainer.fs.mkdir(this.config.workDir!, { recursive: true })

      if (this.config.files) {
        for (const [path, contents] of Object.entries(this.config.files)) {
          const dir = path.substring(0, path.lastIndexOf('/'))
          if (dir) await this.webcontainer.fs.mkdir(dir, { recursive: true })
          await this.webcontainer.fs.writeFile(path, contents)
        }
      }

      if (this.config.packages && this.config.packages.length > 0) {
        this.write(`\x1b[38;2;58;66;96m\u21BB Installing: ${this.config.packages.join(', ')}...\x1b[0m\r\n`)
        const installProcess = await this.webcontainer.spawn('npm', ['install', ...this.config.packages])
        installProcess.output.pipeTo(new WritableStream({ write: (data) => this.write(data) }))
        const exitCode = await installProcess.exit
        if (exitCode !== 0) {
          this.write(`\x1b[38;2;255;68;102m\u2717 npm install failed (exit ${exitCode})\x1b[0m\r\n`)
        }
      }

      this.nodeReady = true
      this.write('\x1b[38;2;0;255;102m\u2713 Node.js 18+ ready\x1b[0m\r\n')
    } catch (err: any) {
      this.write(`\x1b[38;2;255;68;102m\u2717 Node.js boot failed: ${err.message}\x1b[0m\r\n`)
      this.write('\x1b[38;2;58;66;96m  (WebContainers require cross-origin isolation headers)\x1b[0m\r\n')
    }
  }

  private async bootPython(): Promise<void> {
    try {
      this.write('\x1b[38;2;58;66;96m\u21BB Loading Python 3.12 runtime...\x1b[0m\r\n')

      if (!window.loadPyodide) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js'
        script.crossOrigin = 'anonymous'
        document.head.appendChild(script)
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Pyodide'))
        })
      }

      this.pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
        stdout: (text: string) => this.write(text + '\r\n'),
        stderr: (text: string) => this.write(`\x1b[38;2;255;68;102m${text}\x1b[0m\r\n`),
      })

      await this.pyodide.loadPackage(['micropip'])
      this.pythonReady = true
      this.write('\x1b[38;2;0;255;102m\u2713 Python 3.12 ready\x1b[0m\r\n')
    } catch (err: any) {
      this.write(`\x1b[38;2;255;68;102m\u2717 Python boot failed: ${err.message}\x1b[0m\r\n`)
    }
  }

  async execute(input: string): Promise<void> {
    const trimmed = input.trim()
    if (!trimmed) return

    const runtime = detectRuntime(trimmed, this.nodeReady)
    terminalBus.emit('execute', { command: trimmed, runtime }, 'terminal')
    this.config.onCommand?.(trimmed, runtime)

    try {
      switch (runtime) {
        case 'shell': await this.executeShell(trimmed); break
        case 'node': await this.executeNode(trimmed); break
        case 'python': await this.executePython(trimmed); break
      }
    } catch (err: any) {
      this.write(`\x1b[38;2;255;68;102mError: ${err.message}\x1b[0m\r\n`)
      terminalBus.emit('error', { error: err.message, command: trimmed })
    }
  }

  private async executeShell(input: string): Promise<void> {
    const [cmd, ...args] = input.split(/\s+/)

    switch (cmd) {
      case 'clear':
        this.write('\x1b[2J\x1b[H')
        break

      case 'help':
        this.write('\x1b[38;2;0;255;102m0n Web Terminal Commands:\x1b[0m\r\n\r\n')
        this.write('  \x1b[38;2;0;200;255mShell:\x1b[0m     ls, cat, mkdir, touch, rm, cd, pwd, echo, clear, env\r\n')
        this.write('  \x1b[38;2;0;200;255mNode.js:\x1b[0m   node <file>, npm install <pkg>, npx <cmd>\r\n')
        this.write('  \x1b[38;2;0;200;255mPython:\x1b[0m    python <file>, pip install <pkg>\r\n')
        this.write('  \x1b[38;2;0;200;255m0nmcp:\x1b[0m     0nmcp <command> (passthrough to 0nmcp CLI)\r\n')
        this.write('  \x1b[38;2;0;200;255mMeta:\x1b[0m      help, whoami, exit\r\n')
        this.write('\r\n  \x1b[38;2;58;66;96mAuto-detect: Type JS or Python directly \u2014 runtime selected automatically\x1b[0m\r\n')
        break

      case 'whoami': {
        const user = this.config.session?.email || 'anonymous'
        const plan = this.config.session?.plan || 'free'
        this.write(`${user} (${plan})\r\n`)
        break
      }

      case 'pwd':
        this.write(`${this.cwd}\r\n`)
        break

      case 'ls':
        if (this.webcontainer) {
          try {
            const entries = await this.webcontainer.fs.readdir(this.cwd || '/', { withFileTypes: true })
            for (const entry of entries) {
              const color = entry.isDirectory() ? '\x1b[38;2;0;200;255m' : '\x1b[0m'
              const suffix = entry.isDirectory() ? '/' : ''
              this.write(`${color}${entry.name}${suffix}\x1b[0m  `)
            }
            this.write('\r\n')
          } catch {
            this.write('\x1b[38;2;255;68;102mCannot read directory\x1b[0m\r\n')
          }
        } else {
          this.write('\x1b[38;2;58;66;96m(filesystem not available \u2014 Node.js runtime required)\x1b[0m\r\n')
        }
        break

      case 'cat':
        if (this.webcontainer && args[0]) {
          try {
            const content = await this.webcontainer.fs.readFile(args[0], 'utf-8')
            this.write(content + '\r\n')
          } catch {
            this.write(`\x1b[38;2;255;68;102mcat: ${args[0]}: No such file\x1b[0m\r\n`)
          }
        }
        break

      case 'cd':
        if (args[0]) {
          this.cwd = args[0] === '..' ? this.cwd.replace(/\/[^/]+$/, '') || '/' :
                     args[0].startsWith('/') ? args[0] : `${this.cwd}/${args[0]}`
        }
        break

      case 'echo':
        this.write(args.join(' ') + '\r\n')
        break

      case 'env':
        this.write('NODE_ENV=development\r\n')
        this.write('RUNTIME=0n-web-terminal\r\n')
        this.write(`USER=${this.config.session?.email || 'anonymous'}\r\n`)
        this.write(`PLAN=${this.config.session?.plan || 'free'}\r\n`)
        break

      case '0nmcp':
        this.write('\x1b[38;2;0;255;102m0nmcp CLI bridge \u2014 coming soon\x1b[0m\r\n')
        this.write('\x1b[38;2;58;66;96mUse 0nmcp commands via the main console for now\x1b[0m\r\n')
        break

      default:
        if (this.webcontainer) {
          try {
            const process = await this.webcontainer.spawn(cmd, args)
            process.output.pipeTo(new WritableStream({ write: (data) => this.write(data) }))
            await process.exit
          } catch {
            this.write(`\x1b[38;2;255;68;102m${cmd}: command not found\x1b[0m\r\n`)
          }
        } else {
          this.write(`\x1b[38;2;255;68;102m${cmd}: command not found\x1b[0m\r\n`)
        }
    }
  }

  private async executeNode(input: string): Promise<void> {
    if (!this.nodeReady || !this.webcontainer) {
      this.write('\x1b[38;2;255;68;102mNode.js runtime not available\x1b[0m\r\n')
      return
    }

    const [cmd, ...args] = input.split(/\s+/)

    if (cmd === 'npm' || cmd === 'npx') {
      const process = await this.webcontainer.spawn(cmd, args)
      process.output.pipeTo(new WritableStream({ write: (data) => this.write(data) }))
      const exitCode = await process.exit
      if (exitCode !== 0) {
        this.write(`\x1b[38;2;255;68;102mProcess exited with code ${exitCode}\x1b[0m\r\n`)
      }
    } else if (cmd === 'node' && args[0]) {
      const process = await this.webcontainer.spawn('node', args)
      process.output.pipeTo(new WritableStream({ write: (data) => this.write(data) }))
      await process.exit
    } else {
      const code = cmd === 'node' ? args.join(' ') : input
      const evalFile = `try { const __r = eval(${JSON.stringify(code)}); if (__r !== undefined) console.log(__r); } catch(e) { console.error(e.message); }`
      await this.webcontainer.fs.writeFile('/__eval.js', evalFile)
      const process = await this.webcontainer.spawn('node', ['/__eval.js'])
      process.output.pipeTo(new WritableStream({ write: (data) => this.write(data) }))
      await process.exit
    }
  }

  private async executePython(input: string): Promise<void> {
    if (!this.pythonReady || !this.pyodide) {
      this.write('\x1b[38;2;255;68;102mPython runtime not available\x1b[0m\r\n')
      return
    }

    const [cmd, ...args] = input.split(/\s+/)

    if (cmd === 'pip' || cmd === 'micropip') {
      const pkg = args.filter(a => a !== 'install').join(' ')
      if (pkg) {
        this.write(`\x1b[38;2;58;66;96mInstalling ${pkg}...\x1b[0m\r\n`)
        try {
          const micropip = this.pyodide.pyimport('micropip')
          await micropip.install(pkg)
          this.write(`\x1b[38;2;0;255;102m\u2713 Installed ${pkg}\x1b[0m\r\n`)
        } catch (err: any) {
          this.write(`\x1b[38;2;255;68;102m\u2717 Install failed: ${err.message}\x1b[0m\r\n`)
        }
      }
    } else {
      const code = cmd === 'python' ? args.join(' ') : input
      try {
        const result = await this.pyodide.runPythonAsync(code)
        if (result !== undefined && result !== null) {
          this.write(String(result) + '\r\n')
        }
      } catch (err: any) {
        this.write(`\x1b[38;2;255;68;102m${err.message}\x1b[0m\r\n`)
      }
    }
  }

  private write(text: string) {
    this.writeCallback?.(text)
    terminalBus.emit('output', { text })
  }

  async destroy(): Promise<void> {
    this.webcontainer?.teardown()
    this.webcontainer = null
    this.pyodide = null
    terminalBus.destroy()
  }
}
