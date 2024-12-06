//go:build linux
// +build linux

package video

import (
	"os/exec"
	"syscall"
)

func setProcessAttributes(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Pdeathsig: syscall.SIGTERM,
	}
}
