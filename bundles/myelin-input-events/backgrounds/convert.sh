for f in ./*.yml; do
  yaml2json < "$f" > "$f.json"
  echo $f
done