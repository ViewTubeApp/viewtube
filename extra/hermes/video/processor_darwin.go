// +build darwin

package video

import "os/exec"

func setProcessAttributes(cmd *exec.Cmd) {
	// No special process attributes needed for Darwin
}