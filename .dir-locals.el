;; https://github.com/flycheck/flycheck/issues/1087#issuecomment-246783846
((nil . ((eval . (progn
                   (make-local-variable 'exec-path)
                   (add-to-list 'exec-path (concat (locate-dominating-file default-directory ".dir-locals.el") "node_modules/.bin/")))))))
