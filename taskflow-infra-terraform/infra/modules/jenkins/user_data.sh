#!/bin/bash

dnf update -y

sudo dnf install -y java-21-amazon-corretto docker git

systemctl enable docker
systemctl start docker

wget -O /etc/yum.repos.d/jenkins.repo \
https://pkg.jenkins.io/redhat-stable/jenkins.repo

rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

dnf install -y jenkins

usermod -aG docker jenkins

systemctl enable jenkins
systemctl start jenkins