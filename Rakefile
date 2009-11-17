require 'rubygems'
require 'rake'
require 'FileUtils'

task :environment do
  DOJO_PATH = dojo_path = ENV["DOJO_PATH"] || raise("DOJO_PATH is required to build dojox_rails")
  DIST_PATH = File.join(File.dirname(__FILE__), "js")
  PKG_PATH = File.join(File.dirname(__FILE__), "pkg")
  mkdir(DIST_PATH) unless File.directory?("js")
  mkdir(PKG_PATH) unless File.directory?("pkg")
end

task :build_dojox_rails => [:environment] do
  build_path = File.join(DOJO_PATH, "util/buildscripts")
  chdir build_path do
    system("./build.sh action=release profile=rails")
  end
end

task :copy_release_files => [:environment] do
  release_path = File.join(DOJO_PATH, "release", "dojo")
  raise "Release path doesn't exist.  You might need build to first.  Looking for #{release_path}" unless File.directory?(release_path)
  
  File.open("Manifest.txt", "r") do |f|
    f.each do |manifest_file|
      release_file = File.join(release_path, manifest_file.chomp!)
      raise "Could not find release file from Manifest.txt: #{release_file}" unless File.exists?(release_file)
      
      dist_dir = File.join(DIST_PATH, File.dirname(manifest_file))
      FileUtils::mkdir_p(dist_dir) unless File.directory?(dist_dir)
      FileUtils::copy(release_file, dist_dir)
    end
  end
end

task :ensure_dist_manifest => [:environment] do
  File.open("Manifest.txt", "r") do |f|
    f.each do |manifest_file|
      dist_file = File.join(DIST_PATH, manifest_file.chomp!)
      raise "Could not find required from Manifest.txt: #{dist_file}" unless File.exists?(dist_file)
    end
  end
end

task :package => [:environment, :ensure_dist_manifest] do
  pkg_file = "dojox-rails.tgz"
  chdir DIST_PATH do
    system("tar -czvf #{pkg_file} *")
  end
  FileUtils::move(File.join(DIST_PATH, pkg_file), PKG_PATH)
end

task :release => [:build_dojox_rails, :copy_release_files, :package]
task :default => [:release]