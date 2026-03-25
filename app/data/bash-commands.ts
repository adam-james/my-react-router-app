export interface BashCommand {
  id: string;
  name: string;
  category: Category;
  synopsis: string;
  description: string;
  examples: { code: string; explanation: string }[];
  tips?: string[];
  related?: string[];
}

export type Category =
  | "file-management"
  | "text-processing"
  | "system-info"
  | "networking"
  | "process-management"
  | "permissions"
  | "compression"
  | "search"
  | "shell-builtins"
  | "disk-usage";

export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: CategoryInfo[] = [
  {
    id: "file-management",
    label: "File Management",
    description: "Create, move, copy, and delete files and directories",
    icon: "📁",
    color: "bg-blue-500",
  },
  {
    id: "text-processing",
    label: "Text Processing",
    description: "View, filter, transform, and manipulate text",
    icon: "📝",
    color: "bg-emerald-500",
  },
  {
    id: "system-info",
    label: "System Info",
    description: "Inspect system status, hardware, and environment",
    icon: "🖥️",
    color: "bg-purple-500",
  },
  {
    id: "networking",
    label: "Networking",
    description: "Transfer data, check connectivity, and manage network",
    icon: "🌐",
    color: "bg-orange-500",
  },
  {
    id: "process-management",
    label: "Process Management",
    description: "Monitor, control, and signal running processes",
    icon: "⚙️",
    color: "bg-red-500",
  },
  {
    id: "permissions",
    label: "Permissions & Ownership",
    description: "Manage file permissions, users, and groups",
    icon: "🔒",
    color: "bg-yellow-500",
  },
  {
    id: "compression",
    label: "Compression & Archives",
    description: "Compress, decompress, and bundle files",
    icon: "📦",
    color: "bg-pink-500",
  },
  {
    id: "search",
    label: "Search & Find",
    description: "Locate files, search content, and pattern match",
    icon: "🔍",
    color: "bg-cyan-500",
  },
  {
    id: "shell-builtins",
    label: "Shell Builtins",
    description: "Variables, control flow, history, and shell features",
    icon: "💻",
    color: "bg-indigo-500",
  },
  {
    id: "disk-usage",
    label: "Disk & Storage",
    description: "Check disk space, mount points, and storage devices",
    icon: "💾",
    color: "bg-teal-500",
  },
];

export const commands: BashCommand[] = [
  // === File Management ===
  {
    id: "ls",
    name: "ls",
    category: "file-management",
    synopsis: "ls [OPTION]... [FILE]...",
    description: "List directory contents. Shows files and directories in the current or specified directory.",
    examples: [
      { code: "ls -la", explanation: "List all files (including hidden) in long format" },
      { code: "ls -lh", explanation: "Long listing with human-readable file sizes" },
      { code: "ls -R", explanation: "List directories recursively" },
      { code: "ls -lt", explanation: "Sort by modification time, newest first" },
    ],
    tips: ["Use -a to show hidden files (starting with .)", "Combine flags: ls -lah"],
    related: ["tree", "find", "stat"],
  },
  {
    id: "cd",
    name: "cd",
    category: "file-management",
    synopsis: "cd [directory]",
    description: "Change the current working directory. Without arguments, moves to the home directory.",
    examples: [
      { code: "cd /var/log", explanation: "Change to an absolute path" },
      { code: "cd ..", explanation: "Move up one directory" },
      { code: "cd -", explanation: "Switch to the previous directory" },
      { code: "cd ~", explanation: "Go to home directory" },
    ],
    tips: ["cd alone (no args) goes to $HOME", "Use CDPATH to set shortcut base directories"],
    related: ["pwd", "pushd", "popd"],
  },
  {
    id: "cp",
    name: "cp",
    category: "file-management",
    synopsis: "cp [OPTION]... SOURCE DEST",
    description: "Copy files and directories from one location to another.",
    examples: [
      { code: "cp file.txt backup.txt", explanation: "Copy a single file" },
      { code: "cp -r src/ dest/", explanation: "Copy a directory recursively" },
      { code: "cp -i *.txt /backup/", explanation: "Copy interactively (prompt before overwrite)" },
      { code: "cp -p file.txt dest/", explanation: "Preserve permissions, timestamps, and ownership" },
    ],
    tips: ["Always use -r for directories", "-i prevents accidental overwrites"],
    related: ["mv", "rsync", "scp"],
  },
  {
    id: "mv",
    name: "mv",
    category: "file-management",
    synopsis: "mv [OPTION]... SOURCE DEST",
    description: "Move or rename files and directories.",
    examples: [
      { code: "mv old.txt new.txt", explanation: "Rename a file" },
      { code: "mv file.txt /tmp/", explanation: "Move file to another directory" },
      { code: "mv -i src dest", explanation: "Move with interactive prompt before overwrite" },
    ],
    tips: ["mv works for both renaming and moving", "Use -n to never overwrite"],
    related: ["cp", "rename"],
  },
  {
    id: "rm",
    name: "rm",
    category: "file-management",
    synopsis: "rm [OPTION]... FILE...",
    description: "Remove files or directories. Deleted files cannot be recovered easily.",
    examples: [
      { code: "rm file.txt", explanation: "Remove a single file" },
      { code: "rm -r directory/", explanation: "Remove a directory and its contents recursively" },
      { code: "rm -i *.log", explanation: "Prompt before each removal" },
      { code: "rm -rf /tmp/build/", explanation: "Force remove directory without prompts" },
    ],
    tips: ["Always double-check before using rm -rf", "Use trash-cli for safer deletion"],
    related: ["rmdir", "unlink", "shred"],
  },
  {
    id: "mkdir",
    name: "mkdir",
    category: "file-management",
    synopsis: "mkdir [OPTION]... DIRECTORY...",
    description: "Create new directories.",
    examples: [
      { code: "mkdir newdir", explanation: "Create a single directory" },
      { code: "mkdir -p path/to/nested/dir", explanation: "Create nested directories (parents too)" },
      { code: "mkdir -m 755 secure", explanation: "Create directory with specific permissions" },
    ],
    tips: ["-p is essential for creating intermediate directories"],
    related: ["rmdir", "install"],
  },
  {
    id: "touch",
    name: "touch",
    category: "file-management",
    synopsis: "touch [OPTION]... FILE...",
    description: "Create empty files or update file timestamps.",
    examples: [
      { code: "touch newfile.txt", explanation: "Create a new empty file" },
      { code: "touch -t 202301011200 file.txt", explanation: "Set specific timestamp" },
      { code: "touch -r ref.txt file.txt", explanation: "Copy timestamp from reference file" },
    ],
    related: ["stat", "date"],
  },
  {
    id: "ln",
    name: "ln",
    category: "file-management",
    synopsis: "ln [OPTION]... TARGET LINK_NAME",
    description: "Create hard or symbolic links between files.",
    examples: [
      { code: "ln -s /path/to/target link_name", explanation: "Create a symbolic (soft) link" },
      { code: "ln file.txt hardlink.txt", explanation: "Create a hard link" },
      { code: "ln -sf /new/target link_name", explanation: "Force overwrite existing link" },
    ],
    tips: ["Symbolic links work across filesystems, hard links don't", "Use readlink to inspect symlinks"],
    related: ["readlink", "unlink"],
  },

  // === Text Processing ===
  {
    id: "cat",
    name: "cat",
    category: "text-processing",
    synopsis: "cat [OPTION]... [FILE]...",
    description: "Concatenate and display file contents.",
    examples: [
      { code: "cat file.txt", explanation: "Display file contents" },
      { code: "cat file1.txt file2.txt > combined.txt", explanation: "Concatenate files" },
      { code: "cat -n file.txt", explanation: "Show line numbers" },
      { code: "cat -A file.txt", explanation: "Show all characters including non-printing" },
    ],
    related: ["less", "head", "tail", "tac"],
  },
  {
    id: "grep",
    name: "grep",
    category: "text-processing",
    synopsis: "grep [OPTION]... PATTERN [FILE]...",
    description: "Search for patterns in text. One of the most powerful and commonly used commands.",
    examples: [
      { code: "grep 'error' log.txt", explanation: "Search for 'error' in a file" },
      { code: "grep -r 'TODO' src/", explanation: "Recursively search in a directory" },
      { code: "grep -i 'warning' *.log", explanation: "Case-insensitive search" },
      { code: "grep -c 'pattern' file.txt", explanation: "Count matching lines" },
      { code: "grep -E '^[0-9]+' data.txt", explanation: "Use extended regex" },
    ],
    tips: ["Use -v to invert match (show non-matching lines)", "-l shows only filenames with matches"],
    related: ["awk", "sed", "ripgrep"],
  },
  {
    id: "sed",
    name: "sed",
    category: "text-processing",
    synopsis: "sed [OPTION]... 'script' [FILE]...",
    description: "Stream editor for filtering and transforming text line by line.",
    examples: [
      { code: "sed 's/old/new/g' file.txt", explanation: "Replace all occurrences of 'old' with 'new'" },
      { code: "sed -i 's/foo/bar/g' file.txt", explanation: "Edit file in place" },
      { code: "sed -n '5,10p' file.txt", explanation: "Print only lines 5 through 10" },
      { code: "sed '/^#/d' config.txt", explanation: "Delete comment lines" },
    ],
    tips: ["Use -i.bak to create a backup before in-place editing"],
    related: ["awk", "grep", "tr"],
  },
  {
    id: "awk",
    name: "awk",
    category: "text-processing",
    synopsis: "awk 'pattern { action }' [FILE]...",
    description: "Pattern-directed scanning and processing language. Excellent for columnar data.",
    examples: [
      { code: "awk '{print $1}' file.txt", explanation: "Print the first column" },
      { code: "awk -F: '{print $1, $3}' /etc/passwd", explanation: "Use custom field separator" },
      { code: "awk 'NR==5' file.txt", explanation: "Print the 5th line" },
      { code: "awk '{sum += $1} END {print sum}' data.txt", explanation: "Sum values in first column" },
    ],
    tips: ["$0 is the entire line, $1, $2... are fields", "NR is the current line number"],
    related: ["sed", "cut", "grep"],
  },
  {
    id: "head",
    name: "head",
    category: "text-processing",
    synopsis: "head [OPTION]... [FILE]...",
    description: "Display the beginning of a file (first 10 lines by default).",
    examples: [
      { code: "head file.txt", explanation: "Show first 10 lines" },
      { code: "head -n 5 file.txt", explanation: "Show first 5 lines" },
      { code: "head -c 100 file.txt", explanation: "Show first 100 bytes" },
    ],
    related: ["tail", "less", "cat"],
  },
  {
    id: "tail",
    name: "tail",
    category: "text-processing",
    synopsis: "tail [OPTION]... [FILE]...",
    description: "Display the end of a file. Very useful for monitoring logs.",
    examples: [
      { code: "tail file.txt", explanation: "Show last 10 lines" },
      { code: "tail -n 20 file.txt", explanation: "Show last 20 lines" },
      { code: "tail -f /var/log/syslog", explanation: "Follow file in real-time (great for logs)" },
      { code: "tail -f -n 50 app.log", explanation: "Show last 50 lines and follow" },
    ],
    tips: ["tail -f is essential for watching log files in real-time"],
    related: ["head", "less", "journalctl"],
  },
  {
    id: "sort",
    name: "sort",
    category: "text-processing",
    synopsis: "sort [OPTION]... [FILE]...",
    description: "Sort lines of text files alphabetically, numerically, or by other criteria.",
    examples: [
      { code: "sort file.txt", explanation: "Alphabetical sort" },
      { code: "sort -n numbers.txt", explanation: "Numeric sort" },
      { code: "sort -r file.txt", explanation: "Reverse sort" },
      { code: "sort -t: -k3 -n /etc/passwd", explanation: "Sort by 3rd field using : delimiter" },
      { code: "sort -u file.txt", explanation: "Sort and remove duplicates" },
    ],
    related: ["uniq", "shuf", "tsort"],
  },
  {
    id: "uniq",
    name: "uniq",
    category: "text-processing",
    synopsis: "uniq [OPTION]... [INPUT [OUTPUT]]",
    description: "Filter out or report repeated adjacent lines. Usually used with sort.",
    examples: [
      { code: "sort file.txt | uniq", explanation: "Remove duplicate lines (must sort first)" },
      { code: "sort file.txt | uniq -c", explanation: "Count occurrences of each line" },
      { code: "sort file.txt | uniq -d", explanation: "Show only duplicate lines" },
    ],
    tips: ["uniq only removes adjacent duplicates, so sort first!"],
    related: ["sort", "comm"],
  },
  {
    id: "wc",
    name: "wc",
    category: "text-processing",
    synopsis: "wc [OPTION]... [FILE]...",
    description: "Count lines, words, and bytes in files.",
    examples: [
      { code: "wc file.txt", explanation: "Show lines, words, and bytes" },
      { code: "wc -l file.txt", explanation: "Count lines only" },
      { code: "ls | wc -l", explanation: "Count files in current directory" },
    ],
    related: ["nl", "stat"],
  },
  {
    id: "cut",
    name: "cut",
    category: "text-processing",
    synopsis: "cut OPTION... [FILE]...",
    description: "Remove sections from each line of files. Extract columns from data.",
    examples: [
      { code: "cut -d: -f1 /etc/passwd", explanation: "Extract first field with : delimiter" },
      { code: "cut -c1-10 file.txt", explanation: "Extract characters 1-10 from each line" },
      { code: "cut -d',' -f2,4 data.csv", explanation: "Extract 2nd and 4th comma-separated fields" },
    ],
    related: ["awk", "paste", "tr"],
  },
  {
    id: "tr",
    name: "tr",
    category: "text-processing",
    synopsis: "tr [OPTION]... SET1 [SET2]",
    description: "Translate, squeeze, or delete characters from standard input.",
    examples: [
      { code: "echo 'hello' | tr 'a-z' 'A-Z'", explanation: "Convert to uppercase" },
      { code: "echo 'hello   world' | tr -s ' '", explanation: "Squeeze repeated spaces" },
      { code: "tr -d '\\n' < file.txt", explanation: "Delete all newlines" },
      { code: "tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 32", explanation: "Generate random alphanumeric string" },
    ],
    related: ["sed", "cut"],
  },

  // === System Info ===
  {
    id: "uname",
    name: "uname",
    category: "system-info",
    synopsis: "uname [OPTION]...",
    description: "Print system information (kernel name, version, architecture, etc.).",
    examples: [
      { code: "uname -a", explanation: "Print all system information" },
      { code: "uname -r", explanation: "Print kernel release version" },
      { code: "uname -m", explanation: "Print machine hardware architecture" },
    ],
    related: ["hostname", "lsb_release"],
  },
  {
    id: "uptime",
    name: "uptime",
    category: "system-info",
    synopsis: "uptime [OPTION]...",
    description: "Show how long the system has been running plus load averages.",
    examples: [
      { code: "uptime", explanation: "Show uptime and load average" },
      { code: "uptime -p", explanation: "Show uptime in pretty format" },
    ],
    related: ["who", "w", "last"],
  },
  {
    id: "whoami",
    name: "whoami",
    category: "system-info",
    synopsis: "whoami",
    description: "Print the current effective user name.",
    examples: [
      { code: "whoami", explanation: "Print current username" },
    ],
    related: ["id", "who", "w"],
  },
  {
    id: "env",
    name: "env",
    category: "system-info",
    synopsis: "env [OPTION]... [NAME=VALUE]... [COMMAND]",
    description: "Print or modify the environment. Run a command in a modified environment.",
    examples: [
      { code: "env", explanation: "Print all environment variables" },
      { code: "env | grep PATH", explanation: "Show PATH variable" },
      { code: "env -i bash", explanation: "Start a shell with empty environment" },
      { code: "env VAR=value command", explanation: "Run command with a temporary variable" },
    ],
    related: ["export", "printenv", "set"],
  },
  {
    id: "date",
    name: "date",
    category: "system-info",
    synopsis: "date [OPTION]... [+FORMAT]",
    description: "Display or set the system date and time.",
    examples: [
      { code: "date", explanation: "Display current date and time" },
      { code: "date '+%Y-%m-%d %H:%M:%S'", explanation: "Custom format output" },
      { code: "date -u", explanation: "Display UTC time" },
      { code: "date -d '2 days ago'", explanation: "Show date from 2 days ago" },
    ],
    related: ["cal", "timedatectl"],
  },

  // === Networking ===
  {
    id: "curl",
    name: "curl",
    category: "networking",
    synopsis: "curl [OPTION]... URL",
    description: "Transfer data from or to a server. Supports HTTP, FTP, and many more protocols.",
    examples: [
      { code: "curl https://example.com", explanation: "Fetch a webpage" },
      { code: "curl -o file.zip https://example.com/file.zip", explanation: "Download and save to file" },
      { code: "curl -I https://example.com", explanation: "Show HTTP headers only" },
      { code: "curl -X POST -d '{\"key\":\"val\"}' -H 'Content-Type: application/json' url", explanation: "POST JSON data" },
    ],
    tips: ["Use -v for verbose output (debugging)", "-L follows redirects"],
    related: ["wget", "httpie"],
  },
  {
    id: "wget",
    name: "wget",
    category: "networking",
    synopsis: "wget [OPTION]... [URL]...",
    description: "Non-interactive network downloader. Great for downloading files and mirroring sites.",
    examples: [
      { code: "wget https://example.com/file.tar.gz", explanation: "Download a file" },
      { code: "wget -c https://example.com/large.iso", explanation: "Resume an interrupted download" },
      { code: "wget -r -l 2 https://example.com", explanation: "Recursively download 2 levels deep" },
    ],
    related: ["curl", "scp", "rsync"],
  },
  {
    id: "ping",
    name: "ping",
    category: "networking",
    synopsis: "ping [OPTION]... DESTINATION",
    description: "Send ICMP ECHO_REQUEST to network hosts. Tests connectivity and latency.",
    examples: [
      { code: "ping google.com", explanation: "Ping a host continuously" },
      { code: "ping -c 5 192.168.1.1", explanation: "Send exactly 5 pings" },
      { code: "ping -i 0.5 host", explanation: "Ping every 0.5 seconds" },
    ],
    related: ["traceroute", "mtr", "nslookup"],
  },
  {
    id: "ssh",
    name: "ssh",
    category: "networking",
    synopsis: "ssh [OPTION]... [user@]hostname [command]",
    description: "OpenSSH client for secure remote login and command execution.",
    examples: [
      { code: "ssh user@host", explanation: "Connect to a remote host" },
      { code: "ssh -p 2222 user@host", explanation: "Connect on a non-standard port" },
      { code: "ssh user@host 'ls -la /var/log'", explanation: "Run a command remotely" },
      { code: "ssh -L 8080:localhost:80 user@host", explanation: "Set up local port forwarding" },
    ],
    tips: ["Use ssh-keygen to generate key pairs", "~/.ssh/config simplifies connection settings"],
    related: ["scp", "sftp", "ssh-keygen"],
  },
  {
    id: "scp",
    name: "scp",
    category: "networking",
    synopsis: "scp [OPTION]... SOURCE DEST",
    description: "Secure copy files between hosts over SSH.",
    examples: [
      { code: "scp file.txt user@host:/remote/path/", explanation: "Copy file to remote host" },
      { code: "scp user@host:/remote/file.txt ./", explanation: "Copy file from remote host" },
      { code: "scp -r dir/ user@host:/remote/", explanation: "Copy directory recursively" },
    ],
    related: ["rsync", "sftp", "ssh"],
  },

  // === Process Management ===
  {
    id: "ps",
    name: "ps",
    category: "process-management",
    synopsis: "ps [OPTION]...",
    description: "Report a snapshot of current running processes.",
    examples: [
      { code: "ps aux", explanation: "Show all processes with detailed info" },
      { code: "ps -ef", explanation: "Full-format listing of all processes" },
      { code: "ps aux | grep nginx", explanation: "Find a specific process" },
      { code: "ps -u username", explanation: "Show processes for a specific user" },
    ],
    related: ["top", "htop", "pgrep"],
  },
  {
    id: "top",
    name: "top",
    category: "process-management",
    synopsis: "top [OPTION]...",
    description: "Real-time view of running processes, CPU usage, and memory usage.",
    examples: [
      { code: "top", explanation: "Interactive process viewer" },
      { code: "top -u username", explanation: "Show only processes for a user" },
      { code: "top -p 1234", explanation: "Monitor a specific PID" },
    ],
    tips: ["Press 'q' to quit, 'k' to kill a process, 'M' to sort by memory"],
    related: ["htop", "ps", "vmstat"],
  },
  {
    id: "kill",
    name: "kill",
    category: "process-management",
    synopsis: "kill [OPTION]... PID...",
    description: "Send signals to processes. By default sends SIGTERM (graceful termination).",
    examples: [
      { code: "kill 1234", explanation: "Send SIGTERM to process 1234" },
      { code: "kill -9 1234", explanation: "Force kill (SIGKILL) a process" },
      { code: "kill -HUP 1234", explanation: "Send SIGHUP (often reloads config)" },
      { code: "killall nginx", explanation: "Kill all processes by name" },
    ],
    tips: ["Try SIGTERM first, use SIGKILL (-9) as a last resort"],
    related: ["killall", "pkill", "signal"],
  },
  {
    id: "bg",
    name: "bg",
    category: "process-management",
    synopsis: "bg [job_id]",
    description: "Resume a suspended job in the background.",
    examples: [
      { code: "bg", explanation: "Resume the most recent suspended job in background" },
      { code: "bg %2", explanation: "Resume job number 2 in background" },
    ],
    tips: ["Press Ctrl+Z to suspend a foreground process first"],
    related: ["fg", "jobs", "nohup"],
  },
  {
    id: "jobs",
    name: "jobs",
    category: "process-management",
    synopsis: "jobs [OPTION]...",
    description: "List active jobs in the current shell session.",
    examples: [
      { code: "jobs", explanation: "List all jobs" },
      { code: "jobs -l", explanation: "List jobs with PIDs" },
    ],
    related: ["bg", "fg", "disown"],
  },
  {
    id: "nohup",
    name: "nohup",
    category: "process-management",
    synopsis: "nohup COMMAND [ARG]...",
    description: "Run a command immune to hangups, allowing it to continue after logout.",
    examples: [
      { code: "nohup ./script.sh &", explanation: "Run script in background, survives logout" },
      { code: "nohup ./script.sh > output.log 2>&1 &", explanation: "Run with custom output file" },
    ],
    tips: ["Output goes to nohup.out by default", "Consider using tmux or screen instead"],
    related: ["disown", "screen", "tmux"],
  },

  // === Permissions ===
  {
    id: "chmod",
    name: "chmod",
    category: "permissions",
    synopsis: "chmod [OPTION]... MODE FILE...",
    description: "Change file access permissions using symbolic or octal notation.",
    examples: [
      { code: "chmod 755 script.sh", explanation: "rwxr-xr-x — owner full, others read+execute" },
      { code: "chmod +x script.sh", explanation: "Add execute permission for all" },
      { code: "chmod u+w,g-w file.txt", explanation: "Add write for owner, remove for group" },
      { code: "chmod -R 644 docs/", explanation: "Recursively set permissions" },
    ],
    tips: ["Common modes: 644 (files), 755 (scripts/dirs), 600 (private)"],
    related: ["chown", "chgrp", "umask"],
  },
  {
    id: "chown",
    name: "chown",
    category: "permissions",
    synopsis: "chown [OPTION]... OWNER[:GROUP] FILE...",
    description: "Change file owner and/or group.",
    examples: [
      { code: "chown user file.txt", explanation: "Change owner" },
      { code: "chown user:group file.txt", explanation: "Change owner and group" },
      { code: "chown -R www-data:www-data /var/www/", explanation: "Recursively change ownership" },
    ],
    related: ["chmod", "chgrp", "id"],
  },
  {
    id: "umask",
    name: "umask",
    category: "permissions",
    synopsis: "umask [MODE]",
    description: "Set the default permission mask for new files and directories.",
    examples: [
      { code: "umask", explanation: "Show current umask" },
      { code: "umask 022", explanation: "New files: 644, new dirs: 755" },
      { code: "umask 077", explanation: "New files: 600, new dirs: 700 (very private)" },
    ],
    tips: ["umask subtracts permissions from the default (666 for files, 777 for dirs)"],
    related: ["chmod", "chown"],
  },

  // === Compression ===
  {
    id: "tar",
    name: "tar",
    category: "compression",
    synopsis: "tar [OPTION]... [FILE]...",
    description: "Archive utility — bundle multiple files into one archive, with optional compression.",
    examples: [
      { code: "tar -czf archive.tar.gz dir/", explanation: "Create gzip-compressed archive" },
      { code: "tar -xzf archive.tar.gz", explanation: "Extract gzip-compressed archive" },
      { code: "tar -tf archive.tar.gz", explanation: "List archive contents" },
      { code: "tar -cjf archive.tar.bz2 dir/", explanation: "Create bzip2-compressed archive" },
    ],
    tips: ["c=create, x=extract, t=list, z=gzip, j=bzip2, f=filename"],
    related: ["gzip", "zip", "unzip"],
  },
  {
    id: "gzip",
    name: "gzip",
    category: "compression",
    synopsis: "gzip [OPTION]... [FILE]...",
    description: "Compress files using the gzip algorithm. Replaces the original file.",
    examples: [
      { code: "gzip file.txt", explanation: "Compress file (creates file.txt.gz, removes original)" },
      { code: "gzip -d file.txt.gz", explanation: "Decompress (same as gunzip)" },
      { code: "gzip -k file.txt", explanation: "Compress and keep original file" },
      { code: "gzip -9 file.txt", explanation: "Maximum compression" },
    ],
    related: ["gunzip", "bzip2", "xz", "tar"],
  },
  {
    id: "zip",
    name: "zip",
    category: "compression",
    synopsis: "zip [OPTION]... ARCHIVE FILE...",
    description: "Package and compress files into a zip archive.",
    examples: [
      { code: "zip archive.zip file1 file2", explanation: "Create zip with specific files" },
      { code: "zip -r archive.zip directory/", explanation: "Recursively zip a directory" },
      { code: "unzip archive.zip", explanation: "Extract a zip archive" },
      { code: "unzip -l archive.zip", explanation: "List archive contents" },
    ],
    related: ["unzip", "tar", "gzip"],
  },

  // === Search ===
  {
    id: "find",
    name: "find",
    category: "search",
    synopsis: "find [PATH]... [EXPRESSION]",
    description: "Search for files in a directory hierarchy based on various criteria.",
    examples: [
      { code: "find . -name '*.txt'", explanation: "Find all .txt files" },
      { code: "find / -type d -name 'config'", explanation: "Find directories named 'config'" },
      { code: "find . -mtime -7", explanation: "Files modified in the last 7 days" },
      { code: "find . -size +100M", explanation: "Files larger than 100MB" },
      { code: "find . -name '*.log' -delete", explanation: "Find and delete log files" },
      { code: "find . -type f -exec chmod 644 {} \\;", explanation: "Find files and change permissions" },
    ],
    tips: ["Use -maxdepth to limit search depth", "Combine with -exec for powerful automation"],
    related: ["locate", "which", "whereis"],
  },
  {
    id: "locate",
    name: "locate",
    category: "search",
    synopsis: "locate [OPTION]... PATTERN...",
    description: "Find files quickly by searching a pre-built database (faster than find).",
    examples: [
      { code: "locate nginx.conf", explanation: "Find all files matching the pattern" },
      { code: "locate -i readme", explanation: "Case-insensitive search" },
      { code: "sudo updatedb", explanation: "Update the file database" },
    ],
    tips: ["Run updatedb periodically to keep the database current"],
    related: ["find", "which", "whereis"],
  },
  {
    id: "which",
    name: "which",
    category: "search",
    synopsis: "which [OPTION]... NAME...",
    description: "Locate a command's executable in the PATH.",
    examples: [
      { code: "which python", explanation: "Show full path of python executable" },
      { code: "which -a python", explanation: "Show all matching executables in PATH" },
    ],
    related: ["whereis", "type", "command"],
  },
  {
    id: "xargs",
    name: "xargs",
    category: "search",
    synopsis: "xargs [OPTION]... [COMMAND [INITIAL-ARGS]]",
    description: "Build and execute command lines from standard input.",
    examples: [
      { code: "find . -name '*.tmp' | xargs rm", explanation: "Delete files found by find" },
      { code: "cat urls.txt | xargs -n1 curl -O", explanation: "Download each URL in a file" },
      { code: "find . -name '*.js' | xargs grep 'TODO'", explanation: "Search for TODO in JS files" },
      { code: "echo 'a b c' | xargs -n1 echo", explanation: "Process items one at a time" },
    ],
    tips: ["Use -0 with find -print0 for filenames with spaces"],
    related: ["find", "parallel"],
  },

  // === Shell Builtins ===
  {
    id: "echo",
    name: "echo",
    category: "shell-builtins",
    synopsis: "echo [OPTION]... [STRING]...",
    description: "Display a line of text. Commonly used in scripts for output and debugging.",
    examples: [
      { code: "echo 'Hello, World!'", explanation: "Print a string" },
      { code: "echo $HOME", explanation: "Print the value of an environment variable" },
      { code: "echo -e 'line1\\nline2'", explanation: "Interpret escape sequences" },
      { code: "echo -n 'no newline'", explanation: "Print without trailing newline" },
    ],
    related: ["printf", "cat"],
  },
  {
    id: "export",
    name: "export",
    category: "shell-builtins",
    synopsis: "export [NAME[=VALUE]]...",
    description: "Set environment variables available to child processes.",
    examples: [
      { code: "export PATH=$PATH:/new/path", explanation: "Add to PATH" },
      { code: "export EDITOR=vim", explanation: "Set default editor" },
      { code: "export -p", explanation: "List all exported variables" },
    ],
    related: ["env", "set", "unset"],
  },
  {
    id: "alias",
    name: "alias",
    category: "shell-builtins",
    synopsis: "alias [NAME[=VALUE]]...",
    description: "Create shortcut names for commands.",
    examples: [
      { code: "alias ll='ls -la'", explanation: "Create a shortcut for ls -la" },
      { code: "alias gs='git status'", explanation: "Abbreviate git status" },
      { code: "alias", explanation: "List all defined aliases" },
      { code: "unalias ll", explanation: "Remove an alias" },
    ],
    tips: ["Add aliases to ~/.bashrc to make them permanent"],
    related: ["unalias", "function"],
  },
  {
    id: "history",
    name: "history",
    category: "shell-builtins",
    synopsis: "history [N]",
    description: "Display or manipulate the command history list.",
    examples: [
      { code: "history", explanation: "Show full command history" },
      { code: "history 20", explanation: "Show last 20 commands" },
      { code: "!42", explanation: "Re-run command #42 from history" },
      { code: "!!", explanation: "Re-run the last command" },
      { code: "history -c", explanation: "Clear history" },
    ],
    tips: ["Ctrl+R does reverse search through history", "HISTSIZE controls how many commands to keep"],
    related: ["fc"],
  },
  {
    id: "source",
    name: "source",
    category: "shell-builtins",
    synopsis: "source FILENAME [ARGUMENTS]",
    description: "Execute commands from a file in the current shell (not a subshell).",
    examples: [
      { code: "source ~/.bashrc", explanation: "Reload bash configuration" },
      { code: ". .env", explanation: "Load environment variables from .env file (. is short for source)" },
    ],
    tips: ["source vs executing: source runs in current shell, ./script runs in a subshell"],
    related: ["bash", "exec"],
  },

  // === Disk Usage ===
  {
    id: "df",
    name: "df",
    category: "disk-usage",
    synopsis: "df [OPTION]... [FILE]...",
    description: "Report file system disk space usage.",
    examples: [
      { code: "df -h", explanation: "Human-readable sizes for all filesystems" },
      { code: "df -h /home", explanation: "Check space for a specific mount" },
      { code: "df -T", explanation: "Show filesystem types" },
    ],
    related: ["du", "lsblk", "mount"],
  },
  {
    id: "du",
    name: "du",
    category: "disk-usage",
    synopsis: "du [OPTION]... [FILE]...",
    description: "Estimate file and directory space usage.",
    examples: [
      { code: "du -sh *", explanation: "Summary of each item in current directory" },
      { code: "du -h --max-depth=1", explanation: "Show sizes one level deep" },
      { code: "du -sh /var/log", explanation: "Total size of a directory" },
      { code: "du -ah | sort -rh | head -20", explanation: "Top 20 largest files/dirs" },
    ],
    related: ["df", "ncdu", "ls"],
  },
  {
    id: "mount",
    name: "mount",
    category: "disk-usage",
    synopsis: "mount [OPTION]... DEVICE DIRECTORY",
    description: "Mount a filesystem to a directory, making it accessible.",
    examples: [
      { code: "mount", explanation: "Show all mounted filesystems" },
      { code: "mount /dev/sdb1 /mnt/usb", explanation: "Mount a USB drive" },
      { code: "mount -t nfs server:/share /mnt/nfs", explanation: "Mount an NFS share" },
      { code: "umount /mnt/usb", explanation: "Unmount a filesystem" },
    ],
    related: ["umount", "df", "lsblk", "fdisk"],
  },
];

export function getCommandsByCategory(category: Category): BashCommand[] {
  return commands.filter((cmd) => cmd.category === category);
}

export function getCategoryInfo(categoryId: Category): CategoryInfo | undefined {
  return categories.find((c) => c.id === categoryId);
}

export function searchCommands(query: string): BashCommand[] {
  const q = query.toLowerCase().trim();
  if (!q) return commands;
  return commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.synopsis.toLowerCase().includes(q) ||
      cmd.examples.some(
        (ex) => ex.code.toLowerCase().includes(q) || ex.explanation.toLowerCase().includes(q)
      )
  );
}
